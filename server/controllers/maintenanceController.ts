import { Request, Response, NextFunction } from 'express';
import { createCrudController } from './crudController';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../utils/mapping';

const baseCrud = createCrudController({
  tableName: 'maintenance_records',
  defaultSortColumn: 'scheduled_date',
  defaultSortAscending: false,
});

export const maintenanceController = {
  ...baseCrud,

  // Enhanced create with auto-generated ticket number if missing
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      if (!payload || !payload.title) {
        return res.status(400).json({ success: false, error: 'Maintenance title is required' });
      }

      if (!payload.ticketNumber) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        payload.ticketNumber = `MNT-2026-${randomNum}`;
      }
      if (!payload.status) {
        payload.status = 'Scheduled';
      }

      if (!isSupabaseConfigured()) {
        const fakeId = `mnt-${Date.now()}`;
        return res.status(201).json({
          success: true,
          data: { id: fakeId, ...payload },
        });
      }

      const snakePayload = toSnakeCase(payload);
      if (!snakePayload.id) {
        snakePayload.id = `mnt-${Date.now()}`;
      }

      const { data, error } = await supabase
        .from('maintenance_records')
        .insert(snakePayload)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.status(201).json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },

  // Start maintenance action
  start: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Record ID is required' });
      }

      if (!isSupabaseConfigured()) {
        return res.json({
          success: true,
          data: { id, status: 'In Progress' },
          message: `Maintenance ${id} started (mock mode)`,
        });
      }

      const { data: record, error: getErr } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (getErr || !record) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const { data, error } = await supabase
        .from('maintenance_records')
        .update({ status: 'In Progress' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // If attached to a server, set server status to 'Under Maintenance'
      if (record.server_id) {
        await supabase
          .from('servers')
          .update({ status: 'Under Maintenance' })
          .eq('id', record.server_id);
      }

      return res.json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },

  // Complete maintenance action
  complete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Record ID is required' });
      }

      if (!isSupabaseConfigured()) {
        return res.json({
          success: true,
          data: { id, status: 'Completed' },
          message: `Maintenance ${id} completed (mock mode)`,
        });
      }

      const { data: record, error: getErr } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (getErr || !record) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const { data, error } = await supabase
        .from('maintenance_records')
        .update({ status: 'Completed' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // If attached to a server, reset server status to 'Available'
      if (record.server_id) {
        await supabase
          .from('servers')
          .update({ status: 'Available' })
          .eq('id', record.server_id);
      }

      return res.json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },

  // Cancel maintenance action
  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Record ID is required' });
      }

      if (!isSupabaseConfigured()) {
        return res.json({
          success: true,
          data: { id, status: 'Cancelled' },
          message: `Maintenance ${id} cancelled (mock mode)`,
        });
      }

      const { data: record, error: getErr } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (getErr || !record) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      const { data, error } = await supabase
        .from('maintenance_records')
        .update({ status: 'Cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // If attached to a server, reset server status to 'Available'
      if (record.server_id) {
        await supabase
          .from('servers')
          .update({ status: 'Available' })
          .eq('id', record.server_id);
      }

      return res.json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },
};
