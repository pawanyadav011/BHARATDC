const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function seed() {
  console.log('====================================================');
  console.log('SEEDING BHARATDC ENTERPRISE DEMO DATA DIRECTLY INTO SUPABASE');
  console.log('====================================================\n');

  // Fixed deterministic valid hexadecimal UUIDs
  const ORG_IDS = {
    bharatdc: '824c7f1f-26d3-4b30-8bc1-7af95b7605a7',
    niic: '9a1b2c3d-1111-4000-8000-000000000001',
    bpcg: '9a1b2c3d-2222-4000-8000-000000000002',
    upes: '9a1b2c3d-3333-4000-8000-000000000003',
    dntm: '9a1b2c3d-4444-4000-8000-000000000004'
  };

  // 1. ORGANIZATIONS
  console.log('1. Seeding Organizations...');
  const organizations = [
    {
      id: ORG_IDS.bharatdc,
      name: 'BHARATDC',
      code: 'BHARATDC',
      type: 'Enterprise',
      headquarters: 'Mumbai, Maharashtra',
      email: 'admin@bharatdc.in',
      phone: '+91 22 2400 9000',
      status: 'active'
    },
    {
      id: ORG_IDS.niic,
      name: 'National Informatics Infrastructure Corp',
      code: 'NIIC',
      type: 'Government PSU',
      headquarters: 'CGO Complex, Lodhi Road, New Delhi',
      email: 'contact@niic.gov.in',
      phone: '+91 11 2436 0199',
      status: 'active'
    },
    {
      id: ORG_IDS.bpcg,
      name: 'Bharat Petroleum Cloud Grid',
      code: 'BPCG',
      type: 'Public Sector Energy',
      headquarters: 'Ballard Estate, Fort, Mumbai',
      email: 'cloudops@bharatpetroleum.in',
      phone: '+91 22 2271 3000',
      status: 'active'
    },
    {
      id: ORG_IDS.upes,
      name: 'Unified Payments Enterprise Services',
      code: 'UPES',
      type: 'FinTech PSU',
      headquarters: 'BKC, Bandra East, Mumbai',
      email: 'security@upespay.org.in',
      phone: '+91 22 6834 5000',
      status: 'active'
    },
    {
      id: ORG_IDS.dntm,
      name: 'DigiHealth National Telemed',
      code: 'DNTM',
      type: 'Public Health Care',
      headquarters: 'HITEC City, Madhapur, Hyderabad',
      email: 'infra@digihealth.gov.in',
      phone: '+91 40 2311 0050',
      status: 'active'
    }
  ];

  for (const org of organizations) {
    const { error } = await supa.from('organizations').upsert(org);
    if (error) console.error('  Error upserting org:', org.name, error.message);
  }
  console.log(`  Seeded ${organizations.length} organizations.`);

  // 2. PROFILES & AUTH USERS
  console.log('\n2. Seeding 5 Role Accounts into Supabase Auth & Profiles...');
  const devUsers = [
    {
      username: 'admin',
      email: 'admin@bharatdc.local',
      password: 'admin123',
      fullName: 'Rajesh Verma',
      role: 'Super Admin',
      phone: '+91 98200 11001'
    },
    {
      username: 'operations',
      email: 'operations@bharatdc.local',
      password: 'operations123',
      fullName: 'Pooja Kashyap',
      role: 'Operations Manager',
      phone: '+91 98200 11002'
    },
    {
      username: 'engineer',
      email: 'engineer@bharatdc.local',
      password: 'engineer123',
      fullName: 'Amit Pathak',
      role: 'Network Engineer',
      phone: '+91 98200 11003'
    },
    {
      username: 'auditor',
      email: 'auditor@bharatdc.local',
      password: 'auditor123',
      fullName: 'Suresh Menon',
      role: 'Compliance Auditor',
      phone: '+91 98200 11004'
    },
    {
      username: 'staff',
      email: 'staff@bharatdc.local',
      password: 'staff123',
      fullName: 'Kavita Rao',
      role: 'Staff',
      phone: '+91 98200 11005'
    }
  ];

  const USER_IDS = {};

  for (const u of devUsers) {
    const { data: listData } = await supa.auth.admin.listUsers();
    let authUser = listData?.users?.find(x => x.email === u.email);

    if (!authUser) {
      const { data: createData, error: createErr } = await supa.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true
      });
      if (createErr) console.error('  Error creating auth user:', u.email, createErr.message);
      authUser = createData?.user;
    }

    if (authUser) {
      USER_IDS[u.username] = authUser.id;
      const profile = {
        id: authUser.id,
        organization_id: ORG_IDS.bharatdc,
        full_name: u.fullName,
        email: u.email,
        role: u.role,
        phone: u.phone,
        status: 'active',
        two_factor_enabled: false
      };
      const { error: profErr } = await supa.from('profiles').upsert(profile);
      if (profErr) console.error('  Error upserting profile:', u.fullName, profErr.message);
    }
  }
  console.log(`  Seeded ${Object.keys(USER_IDS).length} user profiles.`);

  // 3. DATA CENTERS
  console.log('\n3. Seeding Data Centers...');
  const DC_IDS = {
    mum1: 'dc000000-0000-4000-8000-000000000001',
    del2: 'dc000000-0000-4000-8000-000000000002',
    blr1: 'dc000000-0000-4000-8000-000000000003',
    hyd1: 'dc000000-0000-4000-8000-000000000004',
    maa1: 'dc000000-0000-4000-8000-000000000005'
  };

  const dataCenters = [
    {
      id: DC_IDS.mum1,
      organization_id: ORG_IDS.bharatdc,
      name: 'Mumbai Central Facility (MUM-1)',
      code: 'MUM-1',
      location: 'Mahape Industrial Area, Navi Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      total_racks: 450,
      total_servers: 3200,
      power_capacity_kw: 24000,
      uptime_percentage: 99.999,
      status: 'active'
    },
    {
      id: DC_IDS.del2,
      organization_id: ORG_IDS.bpcg,
      name: 'Delhi NCR Hyperscale (DEL-2)',
      code: 'DEL-2',
      location: 'Sector 62, Electronic City, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      total_racks: 350,
      total_servers: 2400,
      power_capacity_kw: 18500,
      uptime_percentage: 99.995,
      status: 'active'
    },
    {
      id: DC_IDS.blr1,
      organization_id: ORG_IDS.upes,
      name: 'Bengaluru Tech Corridor (BLR-1)',
      code: 'BLR-1',
      location: 'ITPB Road, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      total_racks: 600,
      total_servers: 5400,
      power_capacity_kw: 32000,
      uptime_percentage: 99.999,
      status: 'active'
    },
    {
      id: DC_IDS.hyd1,
      organization_id: ORG_IDS.dntm,
      name: 'Hyderabad Enterprise Zone (HYD-1)',
      code: 'HYD-1',
      location: 'Financial District, Nanakramguda',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      total_racks: 300,
      total_servers: 2100,
      power_capacity_kw: 15000,
      uptime_percentage: 99.992,
      status: 'active'
    },
    {
      id: DC_IDS.maa1,
      organization_id: ORG_IDS.niic,
      name: 'Chennai Coastal Gateway (MAA-1)',
      code: 'MAA-1',
      location: 'OMR Cyber Corridor, Siruseri',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      total_racks: 280,
      total_servers: 1800,
      power_capacity_kw: 14200,
      uptime_percentage: 99.995,
      status: 'active'
    }
  ];

  for (const dc of dataCenters) {
    const { error } = await supa.from('data_centers').upsert(dc);
    if (error) console.error('  Error upserting DC:', dc.name, error.message);
  }
  console.log(`  Seeded ${dataCenters.length} data centers.`);

  // 4. RACKS (Using pure hexadecimal UUIDs)
  console.log('\n4. Seeding Racks...');
  const RACK_IDS = {
    r1: 'a1000000-0000-4000-8000-000000000001',
    r2: 'a1000000-0000-4000-8000-000000000002',
    r3: 'a1000000-0000-4000-8000-000000000003',
    r4: 'a1000000-0000-4000-8000-000000000004',
    r5: 'a1000000-0000-4000-8000-000000000005',
    r6: 'a1000000-0000-4000-8000-000000000006',
    r7: 'a1000000-0000-4000-8000-000000000007',
    r8: 'a1000000-0000-4000-8000-000000000008'
  };

  const racks = [
    {
      id: RACK_IDS.r1,
      data_center_id: DC_IDS.mum1,
      rack_number: 'RACK-A1',
      rack_units: 42,
      occupied_units: 28,
      power_capacity_kw: 12.0,
      current_power_kw: 6.8,
      temperature_celsius: 21.5,
      status: 'active'
    },
    {
      id: RACK_IDS.r2,
      data_center_id: DC_IDS.mum1,
      rack_number: 'RACK-A2',
      rack_units: 42,
      occupied_units: 36,
      power_capacity_kw: 12.0,
      current_power_kw: 8.9,
      temperature_celsius: 22.1,
      status: 'active'
    },
    {
      id: RACK_IDS.r3,
      data_center_id: DC_IDS.del2,
      rack_number: 'RACK-B1',
      rack_units: 42,
      occupied_units: 18,
      power_capacity_kw: 10.0,
      current_power_kw: 4.5,
      temperature_celsius: 21.0,
      status: 'active'
    },
    {
      id: RACK_IDS.r4,
      data_center_id: DC_IDS.del2,
      rack_number: 'RACK-B2',
      rack_units: 42,
      occupied_units: 40,
      power_capacity_kw: 14.0,
      current_power_kw: 11.2,
      temperature_celsius: 23.4,
      status: 'active'
    },
    {
      id: RACK_IDS.r5,
      data_center_id: DC_IDS.blr1,
      rack_number: 'RACK-C1',
      rack_units: 48,
      occupied_units: 32,
      power_capacity_kw: 16.0,
      current_power_kw: 9.8,
      temperature_celsius: 20.8,
      status: 'active'
    },
    {
      id: RACK_IDS.r6,
      data_center_id: DC_IDS.blr1,
      rack_number: 'RACK-C2',
      rack_units: 48,
      occupied_units: 24,
      power_capacity_kw: 16.0,
      current_power_kw: 7.2,
      temperature_celsius: 21.3,
      status: 'active'
    },
    {
      id: RACK_IDS.r7,
      data_center_id: DC_IDS.hyd1,
      rack_number: 'RACK-D1',
      rack_units: 42,
      occupied_units: 20,
      power_capacity_kw: 10.0,
      current_power_kw: 5.1,
      temperature_celsius: 22.0,
      status: 'active'
    },
    {
      id: RACK_IDS.r8,
      data_center_id: DC_IDS.maa1,
      rack_number: 'RACK-E1',
      rack_units: 42,
      occupied_units: 14,
      power_capacity_kw: 10.0,
      current_power_kw: 3.8,
      temperature_celsius: 22.5,
      status: 'active'
    }
  ];

  for (const rack of racks) {
    const { error } = await supa.from('racks').upsert(rack);
    if (error) console.error('  Error upserting rack:', rack.rack_number, error.message);
  }
  console.log(`  Seeded ${racks.length} racks.`);

  // 5. CLIENTS
  console.log('\n5. Seeding Clients...');
  const CLIENT_IDS = {
    c1: 'c1000000-0000-4000-8000-000000000001',
    c2: 'c1000000-0000-4000-8000-000000000002',
    c3: 'c1000000-0000-4000-8000-000000000003',
    c4: 'c1000000-0000-4000-8000-000000000004'
  };

  const clients = [
    {
      id: CLIENT_IDS.c1,
      organization_id: ORG_IDS.niic,
      name: 'Reserve Bank Tech Systems',
      code: 'RBTS',
      contact_person: 'Vikram Malhotra',
      email: 'cloud.ops@rbts.org.in',
      phone: '+91 22 2266 1234',
      address: 'Mint Road, Fort, Mumbai 400001',
      contract_start: '2023-01-01',
      contract_end: '2027-12-31',
      status: 'active'
    },
    {
      id: CLIENT_IDS.c2,
      organization_id: ORG_IDS.bpcg,
      name: 'National Highways Transit Grid',
      code: 'NHTG',
      contact_person: 'Rajeev Singhania',
      email: 'tollcloud@nhtg.gov.in',
      phone: '+91 11 2507 4100',
      address: 'G-5&6, Sector-10, Dwarka, New Delhi 110075',
      contract_start: '2023-06-01',
      contract_end: '2026-05-31',
      status: 'active'
    },
    {
      id: CLIENT_IDS.c3,
      organization_id: ORG_IDS.upes,
      name: 'FinTech Secure Core Ltd',
      code: 'FNSC',
      contact_person: 'Priyanka Sen',
      email: 'systems@fintechsecure.in',
      phone: '+91 80 6789 5500',
      address: 'Koramangala 4th Block, Bengaluru 560034',
      contract_start: '2024-02-15',
      contract_end: '2028-02-14',
      status: 'active'
    },
    {
      id: CLIENT_IDS.c4,
      organization_id: ORG_IDS.dntm,
      name: 'State Health Records Grid',
      code: 'SHRG',
      contact_person: 'Dr. Ramesh Babu',
      email: 'infra@statehealthgrid.telangana.gov.in',
      phone: '+91 40 2465 1122',
      address: 'DMHS Building, Koti, Hyderabad 500095',
      contract_start: '2023-09-01',
      contract_end: '2026-08-31',
      status: 'active'
    }
  ];

  for (const client of clients) {
    const { error } = await supa.from('clients').upsert(client);
    if (error) console.error('  Error upserting client:', client.name, error.message);
  }
  console.log(`  Seeded ${clients.length} clients.`);

  // 6. SERVERS (Using pure hexadecimal UUIDs)
  console.log('\n6. Seeding Servers...');
  const SERVER_IDS = {
    s1: 'b1000000-0000-4000-8000-000000000001',
    s2: 'b1000000-0000-4000-8000-000000000002',
    s3: 'b1000000-0000-4000-8000-000000000003',
    s4: 'b1000000-0000-4000-8000-000000000004',
    s5: 'b1000000-0000-4000-8000-000000000005',
    s6: 'b1000000-0000-4000-8000-000000000006',
    s7: 'b1000000-0000-4000-8000-000000000007',
    s8: 'b1000000-0000-4000-8000-000000000008'
  };

  const servers = [
    {
      id: SERVER_IDS.s1,
      data_center_id: DC_IDS.mum1,
      rack_id: RACK_IDS.r1,
      client_id: null,
      hostname: 'mum1-edge-compute-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00101',
      manufacturer: 'Dell EMC',
      model: 'PowerEdge R750',
      serial_number: 'DELL-R750-MUM01',
      processor: 'Intel Xeon Platinum 8380 40C/80T',
      ram_gb: 256,
      storage_gb: 7680,
      ip_address: '10.10.10.11',
      operating_system: 'RHEL 9.2 Enterprise',
      rack_unit_start: 1,
      rack_unit_size: 2,
      power_watts: 750,
      status: 'Available',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s2,
      data_center_id: DC_IDS.mum1,
      rack_id: RACK_IDS.r1,
      client_id: CLIENT_IDS.c1,
      hostname: 'mum1-core-db-02.bharatdc.in',
      asset_tag: 'BDC-SRV-00102',
      manufacturer: 'HPE',
      model: 'ProLiant DL380 Gen10 Plus',
      serial_number: 'HPE-DL380-MUM02',
      processor: 'AMD EPYC 7763 64C/128T',
      ram_gb: 512,
      storage_gb: 15360,
      ip_address: '10.10.10.12',
      operating_system: 'Oracle Linux 8.8 UEK',
      rack_unit_start: 3,
      rack_unit_size: 2,
      power_watts: 850,
      status: 'In Use',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s3,
      data_center_id: DC_IDS.del2,
      rack_id: RACK_IDS.r3,
      client_id: CLIENT_IDS.c2,
      hostname: 'del2-cloud-node-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00201',
      manufacturer: 'Cisco',
      model: 'UCS B200 M6 Blade',
      serial_number: 'CSCO-UCS-DEL01',
      processor: 'Intel Xeon Gold 6338 32C/64T',
      ram_gb: 128,
      storage_gb: 3840,
      ip_address: '10.20.10.21',
      operating_system: 'Ubuntu 22.04 LTS Server',
      rack_unit_start: 1,
      rack_unit_size: 1,
      power_watts: 450,
      status: 'In Use',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s4,
      data_center_id: DC_IDS.del2,
      rack_id: RACK_IDS.r4,
      client_id: null,
      hostname: 'del2-backup-vault-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00202',
      manufacturer: 'Supermicro',
      model: 'SuperServer 6029P-WTR',
      serial_number: 'SMC-6029-DEL02',
      processor: 'Intel Xeon Silver 4314 16C/32T',
      ram_gb: 64,
      storage_gb: 48000,
      ip_address: '10.20.10.22',
      operating_system: 'Debian 12 Bookworm',
      rack_unit_start: 5,
      rack_unit_size: 2,
      power_watts: 600,
      status: 'Available',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s5,
      data_center_id: DC_IDS.blr1,
      rack_id: RACK_IDS.r5,
      client_id: CLIENT_IDS.c3,
      hostname: 'blr1-fintech-gateway-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00301',
      manufacturer: 'Dell EMC',
      model: 'PowerEdge R650',
      serial_number: 'DELL-R650-BLR01',
      processor: 'Intel Xeon Platinum 8358 32C/64T',
      ram_gb: 256,
      storage_gb: 7680,
      ip_address: '10.30.10.31',
      operating_system: 'RHEL 9.2 Enterprise',
      rack_unit_start: 1,
      rack_unit_size: 1,
      power_watts: 550,
      status: 'In Use',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s6,
      data_center_id: DC_IDS.blr1,
      rack_id: RACK_IDS.r6,
      client_id: null,
      hostname: 'blr1-ml-compute-02.bharatdc.in',
      asset_tag: 'BDC-SRV-00302',
      manufacturer: 'NVIDIA / Supermicro',
      model: 'HGX A100 4-GPU Node',
      serial_number: 'NV-A100-BLR02',
      processor: 'Dual AMD EPYC 7742 128 Cores Total',
      ram_gb: 1024,
      storage_gb: 30720,
      ip_address: '10.30.10.32',
      operating_system: 'Ubuntu 22.04 LTS (NVIDIA DGX)',
      rack_unit_start: 10,
      rack_unit_size: 4,
      power_watts: 2200,
      status: 'Available',
      health_status: 'healthy'
    },
    {
      id: SERVER_IDS.s7,
      data_center_id: DC_IDS.hyd1,
      rack_id: RACK_IDS.r7,
      client_id: null,
      hostname: 'hyd1-telemed-core-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00401',
      manufacturer: 'HPE',
      model: 'ProLiant DL360 Gen10',
      serial_number: 'HPE-DL360-HYD01',
      processor: 'Intel Xeon Gold 5218 16C/32T',
      ram_gb: 128,
      storage_gb: 7680,
      ip_address: '10.40.10.41',
      operating_system: 'RHEL 8.8',
      rack_unit_start: 1,
      rack_unit_size: 1,
      power_watts: 480,
      status: 'Under Maintenance',
      health_status: 'warning'
    },
    {
      id: SERVER_IDS.s8,
      data_center_id: DC_IDS.maa1,
      rack_id: RACK_IDS.r8,
      client_id: null,
      hostname: 'maa1-edge-storage-01.bharatdc.in',
      asset_tag: 'BDC-SRV-00501',
      manufacturer: 'Dell EMC',
      model: 'PowerEdge R740xd',
      serial_number: 'DELL-R740-MAA01',
      processor: 'Intel Xeon Silver 4216 16C/32T',
      ram_gb: 64,
      storage_gb: 96000,
      ip_address: '10.50.10.51',
      operating_system: 'TrueNAS Enterprise',
      rack_unit_start: 1,
      rack_unit_size: 2,
      power_watts: 620,
      status: 'Available',
      health_status: 'healthy'
    }
  ];

  for (const server of servers) {
    const { error } = await supa.from('servers').upsert(server);
    if (error) console.error('  Error upserting server:', server.hostname, error.message);
  }
  console.log(`  Seeded ${servers.length} servers.`);

  // 7. SERVER ALLOCATIONS (Using pure hexadecimal UUIDs)
  console.log('\n7. Seeding Server Allocations...');
  const allocations = [
    {
      id: 'c2000000-0000-4000-8000-000000000001',
      server_id: SERVER_IDS.s2,
      client_id: CLIENT_IDS.c1,
      allocated_by: USER_IDS.operations || null,
      allocation_date: '2024-01-10',
      ip_address: '10.10.10.12',
      vlan: 'VLAN-100',
      notes: 'Core clearance gateway production node',
      status: 'active'
    },
    {
      id: 'c2000000-0000-4000-8000-000000000002',
      server_id: SERVER_IDS.s3,
      client_id: CLIENT_IDS.c2,
      allocated_by: USER_IDS.operations || null,
      allocation_date: '2024-03-01',
      ip_address: '10.20.10.21',
      vlan: 'VLAN-200',
      notes: 'National highway toll telemetry ingestion node',
      status: 'active'
    },
    {
      id: 'c2000000-0000-4000-8000-000000000003',
      server_id: SERVER_IDS.s5,
      client_id: CLIENT_IDS.c3,
      allocated_by: USER_IDS.operations || null,
      allocation_date: '2024-04-15',
      ip_address: '10.30.10.31',
      vlan: 'VLAN-300',
      notes: 'High frequency settlement backend transaction processor',
      status: 'active'
    }
  ];

  for (const alloc of allocations) {
    const { error } = await supa.from('server_allocations').upsert(alloc);
    if (error) console.error('  Error upserting allocation:', alloc.id, error.message);
  }
  console.log(`  Seeded ${allocations.length} allocations.`);

  // 8. MAINTENANCE (Using pure hexadecimal UUIDs)
  console.log('\n8. Seeding Maintenance Records...');
  const maintenanceRecords = [
    {
      id: 'd2000000-0000-4000-8000-000000000001',
      server_id: SERVER_IDS.s7,
      rack_id: RACK_IDS.r7,
      data_center_id: DC_IDS.hyd1,
      title: 'Power Supply Unit Redundancy Replacement',
      description: 'Hot-swap redundant PSU module A exhibiting voltage ripple beyond tolerance threshold.',
      maintenance_type: 'Preventive',
      priority: 'High',
      scheduled_start: '2026-09-24T04:30:00Z',
      scheduled_end: '2026-09-24T06:30:00Z',
      assigned_to: USER_IDS.engineer || null,
      status: 'In Progress'
    },
    {
      id: 'd2000000-0000-4000-8000-000000000002',
      server_id: SERVER_IDS.s1,
      rack_id: RACK_IDS.r1,
      data_center_id: DC_IDS.mum1,
      title: 'Facility Cooling CRAC Unit Quarterly Inspection',
      description: 'Airflow differential pressure calibration and refrigerant charge validation across Server Hall 1.',
      maintenance_type: 'Preventive',
      priority: 'Medium',
      scheduled_start: '2026-09-28T02:00:00Z',
      scheduled_end: '2026-09-28T05:00:00Z',
      assigned_to: USER_IDS.staff || null,
      status: 'Scheduled'
    }
  ];

  for (const m of maintenanceRecords) {
    const { error } = await supa.from('maintenance').upsert(m);
    if (error) console.error('  Error upserting maintenance:', m.title, error.message);
  }
  console.log(`  Seeded ${maintenanceRecords.length} maintenance records.`);

  // 9. NOTIFICATIONS (Using pure hexadecimal UUIDs)
  console.log('\n9. Seeding Notifications...');
  const notifications = [
    {
      id: 'e2000000-0000-4000-8000-000000000001',
      user_id: USER_IDS.admin || null,
      title: 'Mumbai DC Power Consumption Stable',
      message: 'Grid feed voltage within nominal standard 415V +/- 1.5%. Total facility load at 68% of capacity.',
      type: 'info',
      priority: 'info',
      is_read: false
    },
    {
      id: 'e2000000-0000-4000-8000-000000000002',
      user_id: USER_IDS.engineer || null,
      title: 'Hyderabad Node Telemetry Warning',
      message: 'Server hyd1-telemed-core-01 flagged secondary PSU degraded. Maintenance ticket assigned.',
      type: 'warning',
      priority: 'warning',
      is_read: false
    },
    {
      id: 'e2000000-0000-4000-8000-000000000003',
      user_id: USER_IDS.operations || null,
      title: 'New Client SLA Compliance Score 100%',
      message: 'Monthly uptime audit completed for Reserve Bank Tech Systems across MUM-1 servers.',
      type: 'success',
      priority: 'info',
      is_read: true
    },
    {
      id: 'e2000000-0000-4000-8000-000000000004',
      user_id: USER_IDS.auditor || null,
      title: 'Quarterly Access Audit Completed',
      message: 'All physical and logical datacenter hardware access logs archived with cryptographic signature.',
      type: 'info',
      priority: 'info',
      is_read: true
    }
  ];

  for (const n of notifications) {
    const { error } = await supa.from('notifications').upsert(n);
    if (error) console.error('  Error upserting notification:', n.title, error.message);
  }
  console.log(`  Seeded ${notifications.length} notifications.`);

  // 10. REPORTS (Using pure hexadecimal UUIDs)
  console.log('\n10. Seeding Reports...');
  const reports = [
    {
      id: 'f2000000-0000-4000-8000-000000000001',
      organization_id: ORG_IDS.bharatdc,
      created_by: USER_IDS.admin || null,
      name: 'National Infrastructure Capacity & Utilization Audit Q3',
      report_type: 'Capacity Audit',
      description: 'Comprehensive evaluation of compute, power, rack density, and headroom across 5 data centers.',
      file_url: 'https://bharatdc.in/reports/audit-q3-2026.pdf'
    },
    {
      id: 'f2000000-0000-4000-8000-000000000002',
      organization_id: ORG_IDS.bharatdc,
      created_by: USER_IDS.engineer || null,
      name: 'Power Usage Effectiveness (PUE) Optimization Analysis',
      report_type: 'Energy Efficiency',
      description: 'Thermal mapping and cooling efficiency metrics comparing MUM-1 and BLR-1 containment systems.',
      file_url: 'https://bharatdc.in/reports/pue-analysis-2026.pdf'
    },
    {
      id: 'f2000000-0000-4000-8000-000000000003',
      organization_id: ORG_IDS.bharatdc,
      created_by: USER_IDS.operations || null,
      name: 'Institutional Client SLA & Availability Compliance Log',
      report_type: 'SLA Performance',
      description: 'Monthly uptime log verifying 99.999% SLA metrics for RBTS, NHTG, and FNSC allocations.',
      file_url: 'https://bharatdc.in/reports/sla-compliance-sept2026.pdf'
    },
    {
      id: 'f2000000-0000-4000-8000-000000000004',
      organization_id: ORG_IDS.bharatdc,
      created_by: USER_IDS.auditor || null,
      name: 'Hardware Security & Access Control Compliance Dossier',
      report_type: 'Security Compliance',
      description: 'Zero-trust biometric rack access records and cryptographic firmware validation logs.',
      file_url: 'https://bharatdc.in/reports/sec-dossier-2026.pdf'
    }
  ];

  for (const r of reports) {
    const { error } = await supa.from('reports').upsert(r);
    if (error) console.error('  Error upserting report:', r.name, error.message);
  }
  console.log(`  Seeded ${reports.length} reports.`);

  // 11. ACTIVITY HISTORY (Using pure hexadecimal UUIDs)
  console.log('\n11. Seeding Activity History...');
  const activities = [
    {
      id: 'a2000000-0000-4000-8000-000000000001',
      user_id: USER_IDS.admin || null,
      organization_id: ORG_IDS.bharatdc,
      action: 'Cluster Provisioning',
      entity_type: 'Server',
      entity_id: SERVER_IDS.s6,
      description: 'Provisioned NVIDIA A100 4-GPU AI compute node in Bengaluru (BLR-1) Rack C2',
      ip_address: '10.30.1.15'
    },
    {
      id: 'a2000000-0000-4000-8000-000000000002',
      user_id: USER_IDS.operations || null,
      organization_id: ORG_IDS.bharatdc,
      action: 'Server Allocation',
      entity_type: 'Allocation',
      entity_id: SERVER_IDS.s2,
      description: 'Allocated mum1-core-db-02 to Reserve Bank Tech Systems on VLAN-100',
      ip_address: '10.10.1.22'
    },
    {
      id: 'a2000000-0000-4000-8000-000000000003',
      user_id: USER_IDS.engineer || null,
      organization_id: ORG_IDS.bharatdc,
      action: 'Maintenance Scheduled',
      entity_type: 'Maintenance',
      entity_id: SERVER_IDS.s7,
      description: 'Flagged hyd1-telemed-core-01 for redundant PSU module hot-swap',
      ip_address: '10.40.1.18'
    },
    {
      id: 'a2000000-0000-4000-8000-000000000004',
      user_id: USER_IDS.auditor || null,
      organization_id: ORG_IDS.bharatdc,
      action: 'Compliance Verification',
      entity_type: 'Audit',
      entity_id: ORG_IDS.bharatdc,
      description: 'Exported cryptographic access logs for ISO 27001 / Tier IV SOC 2 compliance',
      ip_address: '10.10.1.5'
    },
    {
      id: 'a2000000-0000-4000-8000-000000000005',
      user_id: USER_IDS.staff || null,
      organization_id: ORG_IDS.bharatdc,
      action: 'Rack Thermal Inspection',
      entity_type: 'Rack',
      entity_id: RACK_IDS.r1,
      description: 'Completed cold aisle thermal inspection of RACK-A1 in Mumbai Central Facility',
      ip_address: '10.10.1.42'
    }
  ];

  for (const a of activities) {
    const { error } = await supa.from('activity_history').upsert(a);
    if (error) console.error('  Error upserting activity:', a.action, error.message);
  }
  console.log(`  Seeded ${activities.length} activity records.`);

  console.log('\n====================================================');
  console.log('FINAL QUERY: EXACT LIVE ROW COUNTS FROM SUPABASE POSTGRESQL');
  console.log('====================================================');

  const tables = [
    'organizations',
    'profiles',
    'data_centers',
    'racks',
    'clients',
    'servers',
    'server_allocations',
    'maintenance',
    'notifications',
    'reports',
    'activity_history'
  ];

  const counts = {};
  for (const t of tables) {
    const { count, error } = await supa.from(t).select('*', { count: 'exact', head: true });
    counts[t] = count;
    console.log(`  ${t.padEnd(20)}: ${count} rows ${error ? '(Error: ' + error.message + ')' : ''}`);
  }

  return counts;
}

seed().then(counts => {
  console.log('\nSeed Complete! All data is persisted in Supabase.');
  process.exit(0);
}).catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
