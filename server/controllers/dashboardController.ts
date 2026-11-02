import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { getTableStore } from './crudController';

export const dashboardController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!isSupabaseConfigured()) {
        const serversStore = getTableStore('servers');
        const clientsStore = getTableStore('clients');
        const dcsStore = getTableStore('data_centers');
        const racksStore = getTableStore('racks');

        const allServers = Array.from(serversStore.values());
        const totalServers = allServers.length;
        const availableServers = allServers.filter(s => (s.status || '').toLowerCase() === 'available').length;
        const serversInUse = allServers.filter(s => (s.status || '').toLowerCase() === 'in use').length;
        const serversUnderMaintenance = allServers.filter(s => (s.status || '').toLowerCase() === 'under maintenance').length;
        const serversNotWorking = allServers.filter(s => (s.status || '').toLowerCase() === 'not working').length;
        const totalClients = clientsStore.size;
        const totalDataCenters = dcsStore.size;
        const totalRacks = racksStore.size;

        return res.json({
          success: true,
          data: {
            totalServers,
            availableServers,
            serversInUse,
            serversUnderMaintenance,
            serversNotWorking,
            totalClients,
            totalDataCenters,
            totalRacks,
          },
        });
      }

      // Query table counts and status counts in parallel
      const [
        { count: totalServers },
        { count: availableServers },
        { count: serversInUse },
        { count: serversUnderMaintenance },
        { count: serversNotWorking },
        { count: totalClients },
        { count: totalDataCenters },
        { count: totalRacks },
      ] = await Promise.all([
        supabase.from('servers').select('*', { count: 'exact', head: true }),
        supabase.from('servers').select('*', { count: 'exact', head: true }).eq('status', 'Available'),
        supabase.from('servers').select('*', { count: 'exact', head: true }).eq('status', 'In Use'),
        supabase.from('servers').select('*', { count: 'exact', head: true }).eq('status', 'Under Maintenance'),
        supabase.from('servers').select('*', { count: 'exact', head: true }).eq('status', 'Not Working'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('data_centers').select('*', { count: 'exact', head: true }),
        supabase.from('racks').select('*', { count: 'exact', head: true }),
      ]);

      return res.json({
        success: true,
        data: {
          totalServers: totalServers || 0,
          availableServers: availableServers || 0,
          serversInUse: serversInUse || 0,
          serversUnderMaintenance: serversUnderMaintenance || 0,
          serversNotWorking: serversNotWorking || 0,
          totalClients: totalClients || 0,
          totalDataCenters: totalDataCenters || 0,
          totalRacks: totalRacks || 0,
        },
      });
    } catch (err) {
      return next(err);
    }
  },
};
