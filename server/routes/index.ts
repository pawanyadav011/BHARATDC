import { Router, Request, Response } from 'express';
import { isSupabaseConfigured, supabase } from '../config/supabase';

import authRoutes from './authRoutes';
import dataCentersRoutes from './dataCentersRoutes';
import racksRoutes from './racksRoutes';
import serversRoutes from './serversRoutes';
import clientsRoutes from './clientsRoutes';
import allocationsRoutes from './allocationsRoutes';
import maintenanceRoutes from './maintenanceRoutes';
import organizationsRoutes from './organizationsRoutes';
import usersRoutes from './usersRoutes';
import activityRoutes from './activityRoutes';
import notificationsRoutes from './notificationsRoutes';
import reportsRoutes from './reportsRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// API Root Endpoint
router.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'BHARATDC API is running',
    service: 'BHARATDC Backend',
    status: 'online',
  });
});

// Health Check Endpoint (Requirement 4)
router.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'unconfigured';
  let dbLatencyMs: number | null = null;

  if (isSupabaseConfigured()) {
    const start = Date.now();
    try {
      const { error } = await supabase.from('data_centers').select('id', { count: 'exact', head: true });
      dbLatencyMs = Date.now() - start;
      dbStatus = error ? `error: ${error.message}` : 'connected';
    } catch (e: any) {
      dbStatus = `unreachable: ${e.message}`;
    }
  }

  return res.json({
    status: 'ok',
    service: 'BHARATDC API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'Supabase PostgreSQL',
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
  });
});

// Entity Routes
router.use('/auth', authRoutes);
router.use('/data-centers', dataCentersRoutes);
router.use('/racks', racksRoutes);
router.use('/servers', serversRoutes);
router.use('/clients', clientsRoutes);
router.use('/allocations', allocationsRoutes);
router.use('/server-allocations', allocationsRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/organizations', organizationsRoutes);
router.use('/users', usersRoutes);
router.use('/activity', activityRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
