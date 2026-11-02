import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { toCamelCase, toSnakeCase } from '../utils/mapping';

export interface CrudOptions {
  tableName: string;
  defaultSortColumn?: string;
  defaultSortAscending?: boolean;
  transformIn?: (data: any) => any;
  transformOut?: (data: any) => any;
}

import {
  INITIAL_ORGANIZATIONS,
  INITIAL_DATA_CENTERS,
  INITIAL_RACKS,
  INITIAL_SERVERS,
  INITIAL_CLIENTS,
  INITIAL_ALLOCATIONS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_ACTIVITY,
  INITIAL_USERS,
} from '../data/initialData';

// Global in-memory cache for fast local persistence when unconfigured or testing
export const inMemoryTables = new Map<string, Map<string, any>>();

const seedTable = (tableName: string, data: any[]) => {
  const map = new Map<string, any>();
  for (const item of data) {
    if (item.id) {
      map.set(item.id, item);
    }
  }
  inMemoryTables.set(tableName, map);
};

// Seed all tables with rich enterprise initial dataset
seedTable('organizations', INITIAL_ORGANIZATIONS);
seedTable('data_centers', INITIAL_DATA_CENTERS);
seedTable('racks', INITIAL_RACKS);
seedTable('servers', INITIAL_SERVERS);
seedTable('clients', INITIAL_CLIENTS);
seedTable('allocations', INITIAL_ALLOCATIONS);
seedTable('server_allocations', INITIAL_ALLOCATIONS);
seedTable('maintenance', INITIAL_MAINTENANCE);
seedTable('maintenance_records', INITIAL_MAINTENANCE);
seedTable('notifications', INITIAL_NOTIFICATIONS);
seedTable('reports', INITIAL_REPORTS);
seedTable('activity', INITIAL_ACTIVITY);
seedTable('activity_logs', INITIAL_ACTIVITY);
seedTable('users', INITIAL_USERS);

export const getTableStore = (tableName: string): Map<string, any> => {
  if (!inMemoryTables.has(tableName)) {
    inMemoryTables.set(tableName, new Map<string, any>());
  }
  return inMemoryTables.get(tableName)!;
};

import { randomUUID } from 'crypto';

const SUPABASE_TABLE_MAP: Record<string, string> = {
  allocations: 'server_allocations',
  maintenance_records: 'maintenance',
  users: 'profiles',
  activity: 'activity_history',
  activity_logs: 'activity_history',
};

const TABLE_COLUMNS: Record<string, Set<string>> = {
  clients: new Set(['id', 'organization_id', 'name', 'code', 'contact_person', 'email', 'phone', 'address', 'contract_start', 'contract_end', 'status', 'created_at', 'updated_at']),
  data_centers: new Set(['id', 'organization_id', 'name', 'code', 'location', 'city', 'state', 'country', 'total_racks', 'total_servers', 'power_capacity_kw', 'uptime_percentage', 'status', 'created_at', 'updated_at']),
  racks: new Set(['id', 'data_center_id', 'rack_number', 'rack_units', 'occupied_units', 'power_capacity_kw', 'current_power_kw', 'temperature_celsius', 'status', 'created_at', 'updated_at']),
  servers: new Set(['id', 'data_center_id', 'rack_id', 'client_id', 'hostname', 'asset_tag', 'manufacturer', 'model', 'serial_number', 'processor', 'ram_gb', 'storage_gb', 'ip_address', 'operating_system', 'rack_unit_start', 'rack_unit_size', 'power_watts', 'status', 'health_status', 'last_maintenance', 'created_at', 'updated_at']),
  server_allocations: new Set(['id', 'server_id', 'client_id', 'allocated_by', 'allocation_date', 'release_date', 'ip_address', 'vlan', 'notes', 'status', 'created_at', 'updated_at']),
  maintenance: new Set(['id', 'server_id', 'rack_id', 'data_center_id', 'title', 'description', 'maintenance_type', 'priority', 'scheduled_start', 'scheduled_end', 'completed_at', 'assigned_to', 'status', 'created_at', 'updated_at']),
  profiles: new Set(['id', 'organization_id', 'full_name', 'email', 'role', 'phone', 'avatar_url', 'status', 'two_factor_enabled', 'created_at', 'updated_at']),
  organizations: new Set(['id', 'name', 'code', 'type', 'headquarters', 'email', 'phone', 'status', 'created_at', 'updated_at']),
  notifications: new Set(['id', 'user_id', 'title', 'message', 'type', 'priority', 'is_read', 'created_at']),
  reports: new Set(['id', 'organization_id', 'created_by', 'name', 'report_type', 'description', 'file_url', 'parameters', 'created_at']),
  activity_history: new Set(['id', 'user_id', 'organization_id', 'action', 'entity_type', 'entity_id', 'description', 'ip_address', 'metadata', 'created_at']),
  user_settings: new Set(['id', 'user_id', 'theme', 'notifications_enabled', 'email_notifications', 'timezone', 'preferences', 'created_at', 'updated_at']),
};

const isUUID = (str: any) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const sanitizePayloadForSupabase = (actualTable: string, payload: any) => {
  const allowed = TABLE_COLUMNS[actualTable];
  if (!allowed) return payload;
  const filtered: any = {};
  for (const [key, val] of Object.entries(payload)) {
    if (allowed.has(key)) {
      filtered[key] = val;
    }
  }
  return filtered;
};

export const createCrudController = (options: CrudOptions) => {
  const {
    tableName,
    defaultSortColumn = 'id',
    defaultSortAscending = true,
    transformIn,
    transformOut,
  } = options;

  const actualTable = SUPABASE_TABLE_MAP[tableName] || tableName;
  const store = getTableStore(tableName);

  const applyTransform = (item: any) => {
    if (!item) return item;
    let transformed = { ...item };
    if (tableName === 'data_centers') {
      transformed.manager = transformed.manager || 'Rajesh Verma';
      transformed.contactPhone = transformed.contactPhone || transformed.contact_phone || '+91 22 4589 1100';
      transformed.totalServers = Number(transformed.totalServers || transformed.total_servers || 240);
      transformed.activeServers = Number(transformed.activeServers || transformed.active_servers || 150);
      transformed.powerCapacityKw = Number(transformed.powerCapacityKw || transformed.power_capacity_kw || (transformed.totalPowerCapacityMw ? transformed.totalPowerCapacityMw * 1000 : 1500));
      transformed.status = transformed.status === 'Operational' ? 'Active' : (transformed.status || 'Active');
    } else if (tableName === 'racks') {
      transformed.room = transformed.room || transformed.roomNumber || transformed.room_number || 'Server Hall 1';
      transformed.row = transformed.row || transformed.rowNumber || transformed.row_number || 'Row A';
      transformed.currentPowerKw = Number(transformed.currentPowerKw || transformed.current_power_kw || transformed.powerKw || transformed.power_kw || 4.5);
      transformed.maxPowerKw = Number(transformed.maxPowerKw || transformed.max_power_kw || 15.0);
      transformed.temperatureC = Number(transformed.temperatureC || transformed.temperature_c || transformed.temperatureCelsius || transformed.temperature_celsius || 21.0);
      transformed.status = transformed.status === 'Active' ? 'Available' : (transformed.status === 'Warning' ? 'Full' : (transformed.status || 'Available'));
    } else if (tableName === 'servers') {
      transformed.dataCenterName = transformed.dataCenterName || transformed.data_center_name || 'Mumbai Central Facility (MUM-1)';
      transformed.rackNumber = transformed.rackNumber || transformed.rack_number || 'RACK-A1';
      transformed.primaryIp = transformed.primaryIp || transformed.primary_ip || transformed.ipAddress || transformed.ip_address || '10.10.10.10';
      transformed.cpu = transformed.cpu || transformed.cpuModel || transformed.cpu_model || `${transformed.cpuCores || 32} Cores Enterprise Processor`;
      transformed.unitPosition = transformed.unitPosition || transformed.unit_position || (transformed.rackUnitStart ? `U${transformed.rackUnitStart} - U${transformed.rackUnitStart + (transformed.rackUnitHeight || 2) - 1}` : 'U01 - U02');
      transformed.allocatedClientId = transformed.allocatedClientId || transformed.allocated_client_id || transformed.clientId || transformed.client_id || undefined;
      transformed.clientName = transformed.clientName || transformed.client_name || undefined;
      transformed.purchaseDate = transformed.purchaseDate || transformed.purchase_date || '2023-01-15';
      transformed.warrantyExpiry = transformed.warrantyExpiry || transformed.warranty_expiry || '2027-01-15';
      transformed.status = transformed.status || 'Available';
    } else if (tableName === 'clients') {
      transformed.contactPerson = transformed.contactPerson || transformed.contact_person || 'Client Lead';
      transformed.organization = transformed.organization || 'General Enterprise';
      transformed.billingType = transformed.billingType || transformed.billing_type || 'Monthly';
      transformed.slaTier = transformed.slaTier || transformed.sla_tier || 'Standard';
      transformed.activeAllocationsCount = Number(transformed.activeAllocationsCount || transformed.active_allocations_count || 0);
      transformed.status = transformed.status || 'Active';
    } else if (tableName === 'allocations' || tableName === 'server_allocations') {
      transformed.serverHostname = transformed.serverHostname || transformed.server_hostname || 'server-node.bharatdc.in';
      transformed.assetTag = transformed.assetTag || transformed.asset_tag || 'BDC-SRV-001';
      transformed.clientName = transformed.clientName || transformed.client_name || 'Enterprise Client';
      transformed.dataCenterName = transformed.dataCenterName || transformed.data_center_name || 'Mumbai Central Facility';
      transformed.assignedDate = transformed.assignedDate || transformed.assigned_date || transformed.allocationDate || transformed.allocation_date || '2024-01-10';
      transformed.billingCycle = transformed.billingCycle || transformed.billing_cycle || 'Monthly';
      transformed.purpose = transformed.purpose || 'Production Workload';
      transformed.bandwidthQuotaTb = Number(transformed.bandwidthQuotaTb || transformed.bandwidth_quota_tb || 50);
      transformed.status = transformed.status || 'Active';
    } else if (tableName === 'maintenance' || tableName === 'maintenance_records') {
      transformed.ticketNumber = transformed.ticketNumber || transformed.ticket_number || 'MNT-2026-001';
      transformed.title = transformed.title || 'Scheduled Maintenance';
      transformed.dataCenterName = transformed.dataCenterName || transformed.data_center_name || 'Mumbai Central Facility';
      transformed.type = transformed.type || 'Preventive';
      transformed.priority = transformed.priority || 'Medium';
      transformed.scheduledDate = transformed.scheduledDate || transformed.scheduled_date || transformed.scheduledStart || transformed.scheduled_start || '2026-09-25 10:00 IST';
      transformed.technician = transformed.technician || 'Amit Pathak';
      transformed.notes = transformed.notes || transformed.reason || 'Routine datacenter hardware inspection';
      transformed.status = transformed.status || 'Scheduled';
    } else if (tableName === 'organizations') {
      transformed.primaryContact = transformed.primaryContact || transformed.primary_contact || 'Operations Lead';
      transformed.activeCentersCount = Number(transformed.activeCentersCount || transformed.active_centers_count || transformed.activeDataCentersCount || 1);
      transformed.status = transformed.status || 'Active';
    } else if (tableName === 'users' || tableName === 'profiles') {
      transformed.fullName = transformed.fullName || transformed.full_name || 'Enterprise User';
      transformed.role = transformed.role || 'Staff';
      transformed.username = transformed.username || (transformed.email ? transformed.email.split('@')[0] : 'user');
      transformed.assignedDataCenter = transformed.assignedDataCenter || transformed.assigned_data_center || 'Mumbai Central Facility (MUM-1)';
      transformed.status = transformed.status || 'Active';
    } else if (tableName === 'reports') {
      transformed.generatedDate = transformed.generatedDate || transformed.generated_date || transformed.createdAt || transformed.created_at || '2026-09-20';
      transformed.generatedBy = transformed.generatedBy || transformed.generated_by || transformed.createdBy || transformed.created_by || 'System Automated';
      transformed.format = transformed.format || 'PDF';
      transformed.fileSize = transformed.fileSize || transformed.file_size || '2.4 MB';
      transformed.status = transformed.status || 'Ready';
    } else if (tableName === 'notifications') {
      transformed.timestamp = transformed.timestamp || transformed.createdAt || transformed.created_at || 'Just now';
      transformed.read = transformed.read !== undefined ? transformed.read : (transformed.isRead !== undefined ? transformed.isRead : (transformed.is_read !== undefined ? transformed.is_read : false));
      transformed.priority = transformed.priority || 'info';
      transformed.category = transformed.category || 'Facility';
    } else if (tableName === 'activity' || tableName === 'activity_logs' || tableName === 'activity_history') {
      transformed.timestamp = transformed.timestamp || transformed.createdAt || transformed.created_at || 'Just now';
      transformed.userName = transformed.userName || transformed.user_name || 'Rajesh Verma';
      transformed.targetType = transformed.targetType || transformed.target_type || transformed.entityType || transformed.entity_type || 'Server';
      transformed.targetName = transformed.targetName || transformed.target_name || transformed.entityId || transformed.entity_id || 'System';
      transformed.details = transformed.details || transformed.description || 'System operation executed';
    }
    if (transformOut) {
      transformed = transformOut(transformed);
    }
    return transformed;
  };

  return {
    // GET /api/<entity> - List all records
    getAll: async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!isSupabaseConfigured()) {
          const allRecords = Array.from(store.values());
          let resultData = toCamelCase(allRecords).map(applyTransform);
          return res.json({
            success: true,
            data: resultData,
            meta: { total: resultData.length },
          });
        }

        let query: any = supabase.from(actualTable).select('*');

        // Optional filtering from query params
        const { limit, offset, sortBy, sortOrder, ...filters } = req.query;

        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== '') {
            const snakeKey = toSnakeCase(key);
            query = query.eq(snakeKey, value);
          }
        }

        // Apply sorting
        let sortCol = sortBy ? toSnakeCase(String(sortBy)) : defaultSortColumn;
        const allowedCols = TABLE_COLUMNS[actualTable];
        if (allowedCols && !allowedCols.has(sortCol)) {
          sortCol = allowedCols.has('created_at') ? 'created_at' : (allowedCols.has('id') ? 'id' : Array.from(allowedCols)[0]);
        }
        const ascending = sortOrder === 'desc' ? false : defaultSortAscending;
        query = query.order(sortCol, { ascending });

        // Apply pagination
        if (limit) {
          const limitNum = parseInt(String(limit), 10);
          query = query.limit(limitNum);
          if (offset) {
            const offsetNum = parseInt(String(offset), 10);
            query = query.range(offsetNum, offsetNum + limitNum - 1);
          }
        }

        const { data, error, count } = await query;

        if (error) {
          console.error(`[Supabase Error] ${actualTable}.select:`, error.message);
          return res.status(400).json({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        let resultData = toCamelCase(data || []).map(applyTransform);

        return res.json({
          success: true,
          data: resultData,
          meta: {
            total: count !== null ? count : resultData.length,
          },
        });
      } catch (err) {
        return next(err);
      }
    },

    // GET /api/<entity>/:id - Get single record by ID
    getById: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        if (!isSupabaseConfigured()) {
          const record = store.get(id);
          if (!record) {
            return res.status(404).json({
              success: false,
              error: `Record with ID '${id}' not found in ${tableName}`,
            });
          }
          let formatted = applyTransform(toCamelCase(record));
          return res.json({ success: true, data: formatted });
        }

        const { data, error } = await supabase
          .from(actualTable)
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          return res.status(404).json({
            success: false,
            error: error ? error.message : `Record with ID '${id}' not found in ${tableName}`,
          });
        }

        let recordData = applyTransform(toCamelCase(data));
        return res.json({
          success: true,
          data: recordData,
        });
      } catch (err) {
        return next(err);
      }
    },

    // POST /api/<entity> - Create new record
    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        let payload = req.body;
        if (!payload || Object.keys(payload).length === 0) {
          return res.status(400).json({ success: false, error: 'Request body cannot be empty' });
        }

        if (transformIn) {
          payload = transformIn(payload);
        }

        const snakePayload = toSnakeCase(payload);

        // Generate valid UUID if not present or not a UUID
        if (!snakePayload.id || !isUUID(snakePayload.id)) {
          snakePayload.id = randomUUID();
        }

        if (!isSupabaseConfigured()) {
          store.set(snakePayload.id, snakePayload);
          let created = applyTransform(toCamelCase(snakePayload));
          return res.status(201).json({
            success: true,
            data: created,
          });
        }

        const dbPayload = sanitizePayloadForSupabase(actualTable, snakePayload);

        const { data, error } = await supabase
          .from(actualTable)
          .insert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error(`[Supabase Error] ${actualTable}.insert:`, error.message);
          return res.status(400).json({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
          });
        }

        let created = applyTransform(toCamelCase(data));
        return res.status(201).json({
          success: true,
          data: created,
        });
      } catch (err) {
        return next(err);
      }
    },

    // PUT/PATCH /api/<entity>/:id - Update record
    update: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        let payload = req.body;
        if (!payload || Object.keys(payload).length === 0) {
          return res.status(400).json({ success: false, error: 'Request body cannot be empty' });
        }

        if (transformIn) {
          payload = transformIn(payload);
        }

        const snakePayload = toSnakeCase(payload);
        // Do not update the primary key id
        delete snakePayload.id;

        if (!isSupabaseConfigured()) {
          const existing = store.get(id);
          if (!existing) {
            // If not found in store, create/upsert or return updated
            const createdRecord = { id, ...snakePayload };
            store.set(id, createdRecord);
            return res.json({ success: true, data: applyTransform(toCamelCase(createdRecord)) });
          }
          const updatedRecord = { ...existing, ...snakePayload };
          store.set(id, updatedRecord);
          let updated = applyTransform(toCamelCase(updatedRecord));
          return res.json({ success: true, data: updated });
        }

        const dbPayload = sanitizePayloadForSupabase(actualTable, snakePayload);

        const { data, error } = await supabase
          .from(actualTable)
          .update(dbPayload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error(`[Supabase Error] ${actualTable}.update:`, error.message);
          return res.status(400).json({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        let updated = applyTransform(toCamelCase(data));
        return res.json({
          success: true,
          data: updated,
        });
      } catch (err) {
        return next(err);
      }
    },

    // DELETE /api/<entity>/:id - Delete record
    delete: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        if (!id) {
          return res.status(400).json({ success: false, error: 'Record ID is required' });
        }

        if (!isSupabaseConfigured()) {
          store.delete(id);
          return res.json({
            success: true,
            message: `Record ${id} deleted successfully from ${tableName}`,
          });
        }

        const { error } = await supabase
          .from(actualTable)
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`[Supabase Error] ${actualTable}.delete:`, error.message);
          return res.status(400).json({
            success: false,
            error: error.message,
            code: error.code,
          });
        }

        return res.json({
          success: true,
          message: `Record ${id} deleted successfully from ${tableName}`,
        });
      } catch (err) {
        return next(err);
      }
    },
  };
};
