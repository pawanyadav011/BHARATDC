-- ==============================================================================
-- BHARATDC ENTERPRISE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) SPECIFICATION
-- Database: Supabase PostgreSQL
-- Platform: BHARATDC — Data Center Management Platform
-- Version: 2.0.0 Enterprise Security Hardened
-- ==============================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS & CONSTRAINTS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: organizations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type TEXT DEFAULT 'Enterprise',
    primary_contact TEXT,
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone TEXT,
    active_centers_count INTEGER DEFAULT 0 CHECK (active_centers_count >= 0),
    headquarters TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN (
        'Admin', 'Super Admin', 'Operations Manager', 'Facility Operator', 
        'Network Engineer', 'Technician', 'Compliance Auditor', 'Auditor', 
        'Operator', 'Staff', 'User'
    )),
    organization TEXT,
    assigned_data_center TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Invited')),
    phone TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: data_centers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_centers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    address TEXT,
    total_racks INTEGER NOT NULL DEFAULT 0 CHECK (total_racks >= 0),
    total_servers INTEGER NOT NULL DEFAULT 0 CHECK (total_servers >= 0),
    active_servers INTEGER NOT NULL DEFAULT 0 CHECK (active_servers >= 0),
    power_capacity_kw NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (power_capacity_kw >= 0),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Planned', 'Under Maintenance')),
    manager TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: racks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.racks (
    id TEXT PRIMARY KEY,
    rack_number TEXT NOT NULL,
    data_center_id TEXT NOT NULL REFERENCES public.data_centers(id) ON DELETE RESTRICT,
    data_center_name TEXT,
    room TEXT,
    row TEXT,
    total_units INTEGER NOT NULL DEFAULT 42 CHECK (total_units > 0 AND total_units <= 100),
    used_units INTEGER NOT NULL DEFAULT 0 CHECK (used_units >= 0 AND used_units <= total_units),
    max_power_kw NUMERIC(8, 2) NOT NULL DEFAULT 10.00 CHECK (max_power_kw >= 0),
    current_power_kw NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (current_power_kw >= 0),
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Full', 'Under Maintenance')),
    temperature_c NUMERIC(5, 2) DEFAULT 22.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: servers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.servers (
    id TEXT PRIMARY KEY,
    asset_tag TEXT UNIQUE NOT NULL,
    hostname TEXT NOT NULL,
    serial_number TEXT,
    data_center_id TEXT NOT NULL REFERENCES public.data_centers(id) ON DELETE RESTRICT,
    data_center_name TEXT,
    rack_id TEXT NOT NULL REFERENCES public.racks(id) ON DELETE RESTRICT,
    rack_number TEXT,
    unit_position TEXT,
    model TEXT,
    cpu TEXT,
    ram_gb INTEGER NOT NULL DEFAULT 64 CHECK (ram_gb > 0),
    storage_tb NUMERIC(8, 2) NOT NULL DEFAULT 2.00 CHECK (storage_tb >= 0),
    primary_ip TEXT,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Under Maintenance', 'Not Working')),
    allocated_client_id TEXT,
    client_name TEXT,
    purchase_date DATE,
    warranty_expiry DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: clients
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone TEXT,
    contact_person TEXT,
    billing_type TEXT NOT NULL DEFAULT 'Monthly' CHECK (billing_type IN ('Monthly', 'Quarterly', 'Annual')),
    active_allocations_count INTEGER NOT NULL DEFAULT 0 CHECK (active_allocations_count >= 0),
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Pending')),
    sla_tier TEXT NOT NULL DEFAULT 'Standard' CHECK (sla_tier IN ('Standard', 'Premium', 'Mission Critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: server_allocations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.server_allocations (
    id TEXT PRIMARY KEY,
    server_id TEXT NOT NULL REFERENCES public.servers(id) ON DELETE RESTRICT,
    server_hostname TEXT,
    asset_tag TEXT,
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    client_name TEXT,
    data_center_name TEXT,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    billing_cycle TEXT NOT NULL DEFAULT 'Monthly',
    purpose TEXT,
    bandwidth_quota_tb NUMERIC(8, 2) NOT NULL DEFAULT 10.00 CHECK (bandwidth_quota_tb >= 0),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending Termination', 'Terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: maintenance_records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    server_id TEXT REFERENCES public.servers(id) ON DELETE SET NULL,
    server_hostname TEXT,
    rack_number TEXT,
    data_center_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Preventive', 'Hardware Replacement', 'Firmware Update', 'Emergency Repair')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    technician TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'critical')),
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    category TEXT NOT NULL DEFAULT 'Facility' CHECK (category IN ('Maintenance', 'Server', 'Allocation', 'Facility')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: activity_logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN (
        'Server', 'Rack', 'Data Center', 'Client', 'Allocation', 
        'Maintenance', 'User', 'System', 'Organization', 'Report'
    )),
    target_name TEXT NOT NULL,
    data_center_name TEXT,
    ip_address TEXT,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table: reports
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Capacity', 'Maintenance', 'Server Usage', 'Client Allocation', 'Audit Log')),
    period TEXT NOT NULL,
    generated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    generated_by TEXT NOT NULL,
    file_size TEXT DEFAULT '1.2 MB',
    status TEXT NOT NULL DEFAULT 'Ready' CHECK (status IN ('Ready', 'Generating')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_racks_dc_id ON public.racks(data_center_id);
CREATE INDEX IF NOT EXISTS idx_servers_dc_id ON public.servers(data_center_id);
CREATE INDEX IF NOT EXISTS idx_servers_rack_id ON public.servers(rack_id);
CREATE INDEX IF NOT EXISTS idx_servers_status ON public.servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_client_id ON public.servers(allocated_client_id);
CREATE INDEX IF NOT EXISTS idx_allocations_server_id ON public.server_allocations(server_id);
CREATE INDEX IF NOT EXISTS idx_allocations_client_id ON public.server_allocations(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_server_id ON public.maintenance_records(server_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) ENABLING
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL (RBAC)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
    -- Check user metadata in Supabase Auth JWT first
    IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
        IF (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') IS NOT NULL THEN
            RETURN current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role';
        END IF;
        IF (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IS NOT NULL THEN
            RETURN current_setting('request.jwt.claims', true)::jsonb ->> 'role';
        END IF;
    END IF;

    -- Fallback to querying public.users by auth email
    RETURN COALESCE(
        (SELECT role FROM public.users WHERE email = auth.jwt() ->> 'email' LIMIT 1),
        'Staff'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'service_role') OR 
           (public.current_user_role() IN ('Admin', 'Super Admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_ops_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'service_role') OR 
           (public.current_user_role() IN ('Admin', 'Super Admin', 'Operations Manager', 'Facility Operator'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_infra_engineer_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'service_role') OR 
           (public.current_user_role() IN ('Admin', 'Super Admin', 'Operations Manager', 'Facility Operator', 'Network Engineer', 'Technician'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_auditor_or_above()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'service_role') OR 
           (public.current_user_role() IN ('Admin', 'Super Admin', 'Operations Manager', 'Facility Operator', 'Network Engineer', 'Technician', 'Compliance Auditor', 'Auditor', 'Operator', 'Staff', 'User'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Service Role Bypass Policies (For secure Node.js/Express server interactions)
-- ------------------------------------------------------------------------------
CREATE POLICY "service_role_all_organizations" ON public.organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_data_centers" ON public.data_centers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_racks" ON public.racks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_servers" ON public.servers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_clients" ON public.clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_allocations" ON public.server_allocations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_maintenance" ON public.maintenance_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_activity" ON public.activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_reports" ON public.reports FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- ORGANIZATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "org_select_auth" ON public.organizations FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "org_insert_admin" ON public.organizations FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "org_update_admin" ON public.organizations FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "org_delete_admin" ON public.organizations FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- USERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "users_select_auth" ON public.users FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "users_insert_admin" ON public.users FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "users_update_admin" ON public.users FOR UPDATE TO authenticated
    USING (public.is_admin() OR email = auth.jwt() ->> 'email')
    WITH CHECK (public.is_admin() OR email = auth.jwt() ->> 'email');

CREATE POLICY "users_delete_admin" ON public.users FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- DATA CENTERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "dc_select_auth" ON public.data_centers FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "dc_insert_ops" ON public.data_centers FOR INSERT TO authenticated
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "dc_update_ops" ON public.data_centers FOR UPDATE TO authenticated
    USING (public.is_ops_or_admin())
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "dc_delete_admin" ON public.data_centers FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- RACKS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "racks_select_auth" ON public.racks FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "racks_insert_infra" ON public.racks FOR INSERT TO authenticated
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "racks_update_infra" ON public.racks FOR UPDATE TO authenticated
    USING (public.is_infra_engineer_or_admin())
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "racks_delete_admin" ON public.racks FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- SERVERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "servers_select_auth" ON public.servers FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "servers_insert_infra" ON public.servers FOR INSERT TO authenticated
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "servers_update_infra" ON public.servers FOR UPDATE TO authenticated
    USING (public.is_infra_engineer_or_admin())
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "servers_delete_admin" ON public.servers FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- CLIENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "clients_select_auth" ON public.clients FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "clients_insert_ops" ON public.clients FOR INSERT TO authenticated
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "clients_update_ops" ON public.clients FOR UPDATE TO authenticated
    USING (public.is_ops_or_admin())
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "clients_delete_admin" ON public.clients FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- SERVER ALLOCATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "allocations_select_auth" ON public.server_allocations FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "allocations_insert_ops" ON public.server_allocations FOR INSERT TO authenticated
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "allocations_update_ops" ON public.server_allocations FOR UPDATE TO authenticated
    USING (public.is_ops_or_admin())
    WITH CHECK (public.is_ops_or_admin());

CREATE POLICY "allocations_delete_admin" ON public.server_allocations FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- MAINTENANCE RECORDS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "maintenance_select_auth" ON public.maintenance_records FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "maintenance_insert_infra" ON public.maintenance_records FOR INSERT TO authenticated
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "maintenance_update_infra" ON public.maintenance_records FOR UPDATE TO authenticated
    USING (public.is_infra_engineer_or_admin())
    WITH CHECK (public.is_infra_engineer_or_admin());

CREATE POLICY "maintenance_delete_admin" ON public.maintenance_records FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "notifications_select_auth" ON public.notifications FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "notifications_insert_auth" ON public.notifications FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "notifications_update_auth" ON public.notifications FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "notifications_delete_admin" ON public.notifications FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- ACTIVITY LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "activity_select_auth" ON public.activity_logs FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "activity_insert_auth" ON public.activity_logs FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "activity_delete_admin" ON public.activity_logs FOR DELETE TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- REPORTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "reports_select_auth" ON public.reports FOR SELECT TO authenticated
    USING (public.is_auditor_or_above());

CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT TO authenticated
    WITH CHECK (public.is_auditor_or_above());

CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "reports_delete_admin" ON public.reports FOR DELETE TO authenticated
    USING (public.is_admin());
