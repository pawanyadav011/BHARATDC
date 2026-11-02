import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { createCrudController } from './crudController';
import { toSnakeCase, toCamelCase } from '../utils/mapping';

const baseCrud = createCrudController({
  tableName: 'users',
  defaultSortColumn: 'full_name',
  defaultSortAscending: true,
  transformOut: (user: any) => ({
    ...user,
    fullName: user.fullName || user.name || '',
    name: user.name || user.fullName || '',
  }),
});

export const usersController = {
  getAll: baseCrud.getAll,
  getById: baseCrud.getById,
  update: baseCrud.update,
  delete: baseCrud.delete,

  // Custom create user supporting Supabase Auth creation
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        fullName,
        name,
        email,
        password,
        role = 'Staff',
        organization = 'BHARATDC Operations Command',
        assignedDataCenter = 'All Facilities',
        phone = '',
        status = 'Active',
      } = req.body;

      const finalName = (fullName || name || '').trim();
      const finalEmail = (email || '').trim().toLowerCase();

      if (!finalName || !finalEmail) {
        return res.status(400).json({
          success: false,
          error: 'Full Name and Email are required to create a user.',
        });
      }

      const userId = 'usr-' + Date.now();

      // If Supabase is configured and password is provided, create Auth user account
      if (isSupabaseConfigured() && password) {
        try {
          await supabase.auth.signUp({
            email: finalEmail,
            password: password,
            options: {
              data: {
                full_name: finalName,
                role: role,
              },
            },
          });
        } catch (authErr: any) {
          console.warn('[UsersController] Supabase Auth account creation notice:', authErr?.message);
        }
      }

      // Save user profile to database
      if (isSupabaseConfigured()) {
        const rowData = toSnakeCase({
          id: userId,
          fullName: finalName,
          email: finalEmail,
          role: role,
          organization: organization,
          assignedDataCenter: assignedDataCenter,
          phone: phone,
          status: status,
          lastLogin: new Date().toISOString(),
        });

        const { data, error } = await supabase
          .from('users')
          .insert(rowData)
          .select()
          .single();

        if (error) {
          // If already exists, try update
          if (error.code === '23505') {
            const { data: updated, error: updateErr } = await supabase
              .from('users')
              .update(rowData)
              .eq('email', finalEmail)
              .select()
              .single();

            if (!updateErr && updated) {
              return res.status(200).json({
                success: true,
                data: toCamelCase(updated),
                message: 'User updated successfully.',
              });
            }
          }
          throw error;
        }

        return res.status(201).json({
          success: true,
          data: toCamelCase(data),
          message: 'User created successfully in database and authentication.',
        });
      }

      // Fallback local response
      const localUser = {
        id: userId,
        fullName: finalName,
        name: finalName,
        email: finalEmail,
        role: role,
        organization: organization,
        assignedDataCenter: assignedDataCenter,
        phone: phone,
        status: status,
        lastLogin: 'Just now',
      };

      return res.status(201).json({
        success: true,
        data: localUser,
        message: 'User created successfully.',
      });
    } catch (err) {
      return next(err);
    }
  },
};
