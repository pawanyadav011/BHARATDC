import { Request, Response, NextFunction } from 'express';
import { createCrudController } from './crudController';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../utils/mapping';

const baseCrud = createCrudController({
  tableName: 'server_allocations',
  defaultSortColumn: 'assigned_date',
  defaultSortAscending: false,
});

export const allocationsController = {
  ...baseCrud,

  // Enhanced create allocation that also updates server status to 'In Use'
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      if (!payload || !payload.serverId || !payload.clientId) {
        return res.status(400).json({
          success: false,
          error: 'serverId and clientId are required',
        });
      }

      if (!isSupabaseConfigured()) {
        const fakeId = `alloc-${Date.now()}`;
        return res.status(201).json({
          success: true,
          data: {
            id: fakeId,
            ...payload,
            status: payload.status || 'Active',
            assignedDate: payload.assignedDate || new Date().toISOString().split('T')[0],
          },
        });
      }

      const snakePayload = toSnakeCase({
        ...payload,
        status: payload.status || 'Active',
        assignedDate: payload.assignedDate || new Date().toISOString().split('T')[0],
      });

      if (!snakePayload.id) {
        snakePayload.id = `alloc-${Date.now()}`;
      }

      const { data, error } = await supabase
        .from('server_allocations')
        .insert(snakePayload)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Update server status to 'In Use'
      await supabase
        .from('servers')
        .update({
          status: 'In Use',
          allocated_client_id: payload.clientId,
          client_name: payload.clientName || null,
        })
        .eq('id', payload.serverId);

      return res.status(201).json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },

  // Enhanced delete/remove assignment that resets server status back to 'Available'
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Allocation ID is required' });
      }

      if (!isSupabaseConfigured()) {
        return res.json({ success: true, message: `Allocation ${id} removed (mock mode)` });
      }

      // Retrieve allocation to know which server to free
      const { data: alloc } = await supabase
        .from('server_allocations')
        .select('server_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('server_allocations')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Reset server status to 'Available'
      if (alloc && alloc.server_id) {
        await supabase
          .from('servers')
          .update({
            status: 'Available',
            allocated_client_id: null,
            client_name: null,
          })
          .eq('id', alloc.server_id);
      }

      return res.json({
        success: true,
        message: `Allocation ${id} removed successfully`,
      });
    } catch (err) {
      return next(err);
    }
  },
};
