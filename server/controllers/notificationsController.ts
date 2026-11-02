import { Request, Response, NextFunction } from 'express';
import { createCrudController } from './crudController';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { toCamelCase } from '../utils/mapping';

const baseCrud = createCrudController({
  tableName: 'notifications',
  defaultSortColumn: 'timestamp',
  defaultSortAscending: false,
});

export const notificationsController = {
  ...baseCrud,

  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Notification ID is required' });
      }

      if (!isSupabaseConfigured()) {
        return res.json({ success: true, message: `Notification ${id} marked as read (mock)` });
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({
        success: true,
        data: toCamelCase(data),
      });
    } catch (err) {
      return next(err);
    }
  },

  markAllAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isSupabaseConfigured()) {
        return res.json({ success: true, message: 'All notifications marked as read (mock)' });
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (err) {
      return next(err);
    }
  },
};
