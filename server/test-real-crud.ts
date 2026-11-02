/**
 * BHARATDC End-to-End Real CRUD & Module Verification Test Suite
 * Tests All Phases (Dashboard, Organizations, Users, Clients, Data Centers,
 * Racks, Servers, Allocations, Maintenance, Notifications, Reports, Activity)
 */

const API_BASE = 'http://localhost:5000/api';

const authHeaders = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer demo-token-admin-root',
  'X-User-Role': 'Super Admin',
  'X-User-Email': 'admin@bharatdc.in',
};

const results: { phase: string; name: string; passed: boolean; details?: string }[] = [];

async function testStep(phase: string, name: string, fn: () => Promise<boolean | void>) {
  try {
    await fn();
    results.push({ phase, name, passed: true });
    console.log(`✅ [${phase}] ${name}`);
  } catch (err: any) {
    results.push({ phase, name, passed: false, details: err.message });
    console.error(`❌ [${phase}] ${name} -> ${err.message}`);
  }
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data?.error || data?.message || res.statusText}`);
  }
  return data;
}

async function runRealCrudSuite() {
  console.log('===============================================================');
  console.log('🚀 BHARATDC REAL CRUD & FULL APPLICATION SUITE VERIFICATION');
  console.log('===============================================================\n');

  // PHASE 1: Dashboard Stats
  await testStep('PHASE 1 - Dashboard', 'Fetch Real Dashboard Stats', async () => {
    const data = await request('/dashboard/stats');
    if (typeof data.data?.totalServers !== 'number') throw new Error('Invalid dashboard stats structure');
  });

  // PHASE 2: Organizations CRUD
  let createdOrgId = '';
  await testStep('PHASE 2 - Organizations', 'Create Organization', async () => {
    const org = await request('/organizations', {
      method: 'POST',
      body: JSON.stringify({
        name: 'National Digital Pipeline',
        code: `NDP-${Date.now().toString().slice(-4)}`,
        type: 'Public Sector',
        email: 'ops@ndp.gov.in',
        phone: '+91 11 2000 1122',
        headquarters: 'New Delhi',
        status: 'Active',
      }),
    });
    createdOrgId = org.data?.id;
    if (!createdOrgId) throw new Error('Org ID missing from response');
  });

  await testStep('PHASE 2 - Organizations', 'Get & Update Organization', async () => {
    await request(`/organizations/${createdOrgId}`);
    await request(`/organizations/${createdOrgId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'National Digital Pipeline Updated' }),
    });
  });

  await testStep('PHASE 2 - Organizations', 'Delete Organization', async () => {
    await request(`/organizations/${createdOrgId}`, { method: 'DELETE' });
  });

  // PHASE 3: Users CRUD
  let createdUserId = '';
  await testStep('PHASE 3 - Users', 'Create User', async () => {
    const usr = await request('/users', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Dr. Vikram Sarabhai',
        email: `vikram.${Date.now()}@bharatdc.gov.in`,
        role: 'Operations Manager',
        status: 'Active',
        assignedDataCenter: 'MUM-1',
        phone: '+91 22 2400 9100',
      }),
    });
    createdUserId = usr.data?.id;
    if (!createdUserId) throw new Error('User ID missing');
  });

  await testStep('PHASE 3 - Users', 'Update & Delete User', async () => {
    await request(`/users/${createdUserId}`, {
      method: 'PUT',
      body: JSON.stringify({ role: 'Super Admin' }),
    });
    await request(`/users/${createdUserId}`, { method: 'DELETE' });
  });

  // PHASE 4: Clients CRUD
  let createdClientId = '';
  await testStep('PHASE 4 - Clients', 'Create Client', async () => {
    const cli = await request('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bharat Telecom Labs',
        organization: 'Bharat Telecom',
        email: `contact.${Date.now()}@btel.in`,
        phone: '+91 22 4567 8900',
        billingType: 'Monthly',
        status: 'Active',
        slaTier: 'Mission Critical',
      }),
    });
    createdClientId = cli.data?.id;
    if (!createdClientId) throw new Error('Client ID missing');
  });

  await testStep('PHASE 4 - Clients', 'Update & Delete Client', async () => {
    await request(`/clients/${createdClientId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Suspended' }),
    });
    await request(`/clients/${createdClientId}`, { method: 'DELETE' });
  });

  // PHASE 5: Data Centers CRUD
  let createdDcId = '';
  await testStep('PHASE 5 - Data Centers', 'Create Data Center', async () => {
    const dc = await request('/data-centers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'BHARATDC Chennai Central (MAA-1)',
        code: `MAA-${Date.now().toString().slice(-4)}`,
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        totalRacks: 40,
        totalServers: 400,
        activeServers: 360,
        powerCapacityKw: 1200,
        status: 'Active',
        manager: 'Senthil Nathan',
        contactPhone: '+91 44 2800 9000',
      }),
    });
    createdDcId = dc.data?.id;
    if (!createdDcId) throw new Error('DC ID missing');
  });

  await testStep('PHASE 5 - Data Centers', 'Update & Delete Data Center', async () => {
    await request(`/data-centers/${createdDcId}`, {
      method: 'PUT',
      body: JSON.stringify({ powerCapacityKw: 1400 }),
    });
    await request(`/data-centers/${createdDcId}`, { method: 'DELETE' });
  });

  // PHASE 6: Racks CRUD
  let createdRackId = '';
  await testStep('PHASE 6 - Racks', 'Create Rack', async () => {
    const rack = await request('/racks', {
      method: 'POST',
      body: JSON.stringify({
        rackNumber: `RK-BLR-${Date.now().toString().slice(-4)}`,
        dataCenterId: 'dc-blr-1',
        dataCenterName: 'BHARATDC Bengaluru South',
        room: 'Server Hall A',
        row: 'Row 04',
        totalUnits: 42,
        usedUnits: 12,
        maxPowerKw: 14,
        currentPowerKw: 4.8,
        status: 'Available',
        temperatureC: 21.5,
      }),
    });
    createdRackId = rack.data?.id;
    if (!createdRackId) throw new Error('Rack ID missing');
  });

  await testStep('PHASE 6 - Racks', 'Update & Delete Rack', async () => {
    await request(`/racks/${createdRackId}`, {
      method: 'PUT',
      body: JSON.stringify({ usedUnits: 16 }),
    });
    await request(`/racks/${createdRackId}`, { method: 'DELETE' });
  });

  // PHASE 7: Servers CRUD
  let createdServerId = '';
  await testStep('PHASE 7 - Servers', 'Create Server', async () => {
    const srv = await request('/servers', {
      method: 'POST',
      body: JSON.stringify({
        assetTag: `SRV-IND-${Date.now().toString().slice(-4)}`,
        hostname: 'node-sec-audit.bharatdc.in',
        serialNumber: 'SN-998811',
        dataCenterId: 'dc-mum-1',
        dataCenterName: 'BHARATDC Mumbai West',
        rackId: 'rack-mum-01',
        rackNumber: 'RK-MUM-01',
        unitPosition: 'U10 - U12',
        model: 'Dell PowerEdge R750',
        cpu: '2x AMD EPYC 7763 (128 Cores)',
        ramGb: 512,
        storageTb: 32,
        primaryIp: '10.14.30.100',
        status: 'Available',
      }),
    });
    createdServerId = srv.data?.id;
    if (!createdServerId) throw new Error('Server ID missing');
  });

  await testStep('PHASE 7 - Servers', 'Update & Delete Server', async () => {
    await request(`/servers/${createdServerId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'In Use' }),
    });
    await request(`/servers/${createdServerId}`, { method: 'DELETE' });
  });

  // PHASE 8: Server Allocations
  let createdAllocId = '';
  await testStep('PHASE 8 - Allocations', 'Allocate & Release Server', async () => {
    // Create safe dummy server & client first
    const srv = await request('/servers', {
      method: 'POST',
      body: JSON.stringify({
        assetTag: `SRV-ALC-${Date.now().toString().slice(-4)}`,
        hostname: 'node-alloc-test.bharatdc.in',
        dataCenterId: 'dc-mum-1',
        rackId: 'rack-mum-01',
        ramGb: 128,
        storageTb: 8,
        status: 'Available',
      }),
    });
    const cli = await request('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alloc Test Org',
        email: `alloc.${Date.now()}@test.org`,
        billingType: 'Monthly',
        status: 'Active',
      }),
    });

    const alloc = await request('/allocations', {
      method: 'POST',
      body: JSON.stringify({
        serverId: srv.data.id,
        clientId: cli.data.id,
        purpose: 'E-Governance Gateway Load',
        bandwidthQuotaTb: 100,
        billingCycle: 'Annual',
      }),
    });

    createdAllocId = alloc.data?.id;
    if (!createdAllocId) throw new Error('Alloc ID missing');

    // Clean up
    await request(`/allocations/${createdAllocId}`, { method: 'DELETE' });
    await request(`/servers/${srv.data.id}`, { method: 'DELETE' });
    await request(`/clients/${cli.data.id}`, { method: 'DELETE' });
  });

  // PHASE 9: Maintenance Workflow
  let createdMntId = '';
  await testStep('PHASE 9 - Maintenance', 'Lifecycle: Create -> Start -> Complete -> Delete', async () => {
    const mnt = await request('/maintenance', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Thermal Chiller Unit Quarterly Overhaul',
        dataCenterName: 'BHARATDC Mumbai West',
        type: 'Preventive',
        priority: 'High',
        technician: 'Ramesh Patel',
      }),
    });
    createdMntId = mnt.data?.id;
    if (!createdMntId) throw new Error('Maintenance ID missing');

    // Start
    await request(`/maintenance/${createdMntId}/start`, { method: 'POST' });
    // Complete
    await request(`/maintenance/${createdMntId}/complete`, { method: 'POST' });
    // Clean up
    await request(`/maintenance/${createdMntId}`, { method: 'DELETE' });
  });

  // PHASE 10: Notifications
  let notifId = '';
  await testStep('PHASE 10 - Notifications', 'Create -> Read -> Mark All Read -> Delete', async () => {
    const notif = await request('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Cluster Energy Alert',
        message: 'Solar array feeding 28% supplementary load.',
        priority: 'info',
      }),
    });
    notifId = notif.data?.id;
    if (!notifId) throw new Error('Notif ID missing');

    await request(`/notifications/${notifId}/read`, { method: 'POST' });
    await request('/notifications/mark-all-read', { method: 'POST' });
    await request(`/notifications/${notifId}`, { method: 'DELETE' });
  });

  // PHASE 11: Activity History
  await testStep('PHASE 11 - Activity History', 'List & Log Activity', async () => {
    const list = await request('/activity');
    if (!Array.isArray(list.data)) throw new Error('Activity list must be array');

    await request('/activity', {
      method: 'POST',
      body: JSON.stringify({
        userName: 'Admin User',
        action: 'System Security Verification',
        targetType: 'System',
        targetName: 'BHARATDC Core API',
        details: 'Automated test suite verification cycle executed',
      }),
    });
  });

  // PHASE 12: Reports
  let reportId = '';
  await testStep('PHASE 12 - Reports', 'Generate & Delete Report', async () => {
    const rep = await request('/reports', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Q3 Sovereign Compute Audit',
        type: 'Audit Log',
        period: 'Q3 2026',
        generatedBy: 'Rajesh Verma',
      }),
    });
    reportId = rep.data?.id;
    if (!reportId) throw new Error('Report ID missing');
    await request(`/reports/${reportId}`, { method: 'DELETE' });
  });

  // PHASE 13 & 14: Auth Profile & Current Session
  await testStep('PHASE 13 & 14 - Auth & Profile', 'Get Current Profile via /auth/me', async () => {
    const me = await request('/auth/me');
    if (!me.user) throw new Error('User profile missing from /auth/me');
  });

  console.log('\n===============================================================');
  console.log('📊 TEST SUMMARY:');
  console.log('===============================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  console.log(`TOTAL PHASES/MODULES TESTED: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('===============================================================');

  if (passed === total) {
    console.log('🎉 ALL 14 PHASES & REAL CRUD OPERATIONS PASSED 100%!');
  } else {
    console.error('⚠️ SOME CRUD TESTS FAILED.');
  }
}

runRealCrudSuite();
