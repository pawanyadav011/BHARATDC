/**
 * BHARATDC Security & RBAC Automated Test Suite
 * Validates Security Scenarios A through F:
 * - Scenario A: Unauthenticated requests -> 401
 * - Scenario B: Insufficient role permissions -> 403
 * - Scenario C: Authenticated & Authorized requests -> 200/201
 * - Scenario D: Invalid input validation -> 400
 * - Scenario E: Nonexistent resource query -> 404
 * - Scenario F: Normal valid CRUD lifecycle -> 200/201
 */

const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  scenario: string;
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  message?: string;
}

const results: TestResult[] = [];

async function assertApi(
  scenario: string,
  name: string,
  url: string,
  options: RequestInit,
  expectedStatus: number
): Promise<{ status: number; body: any }> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    const passed = res.status === expectedStatus;
    results.push({
      scenario,
      name,
      passed,
      expectedStatus,
      actualStatus: res.status,
      message: passed ? 'PASSED' : `FAILED (Expected ${expectedStatus}, got ${res.status}: ${JSON.stringify(body)})`,
    });

    return { status: res.status, body };
  } catch (err: any) {
    results.push({
      scenario,
      name,
      passed: false,
      expectedStatus,
      actualStatus: 0,
      message: `NETWORK ERROR: ${err.message}`,
    });
    return { status: 0, body: null };
  }
}

async function runSecuritySuite() {
  console.log('===============================================================');
  console.log('🛡️  BHARATDC AUTOMATED SECURITY & RLS COMPLIANCE AUDIT TEST SUITE');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST SCENARIO A: Unauthenticated Requests -> Must Receive 401
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario A: Unauthenticated Request Checks (401)...');

  await assertApi('A', 'Unauthenticated GET /data-centers', '/data-centers', { method: 'GET' }, 401);
  await assertApi('A', 'Unauthenticated GET /servers', '/servers', { method: 'GET' }, 401);
  await assertApi('A', 'Unauthenticated POST /servers', '/servers', {
    method: 'POST',
    body: JSON.stringify({ hostname: 'srv-test', assetTag: 'SRV-01' }),
  }, 401);
  await assertApi('A', 'Unauthenticated DELETE /clients/cli-123', '/clients/cli-123', { method: 'DELETE' }, 401);
  await assertApi('A', 'Unauthenticated GET /dashboard/stats', '/dashboard/stats', { method: 'GET' }, 401);

  // --------------------------------------------------------------------------
  // TEST SCENARIO B: Authenticated User with Insufficient Permissions -> 403
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario B: RBAC Insufficient Permissions Checks (403)...');

  // Technician token attempting Admin-only operation (DELETE server)
  await assertApi('B', 'Technician attempting DELETE /servers/srv-101', '/servers/srv-101', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer demo-token-tech-1',
      'X-User-Role': 'Technician',
    },
  }, 403);

  // Compliance Auditor attempting Admin-only operation (POST /organizations)
  await assertApi('B', 'Auditor attempting POST /organizations', '/organizations', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-auditor-1',
      'X-User-Role': 'Compliance Auditor',
    },
    body: JSON.stringify({ name: 'Org X', code: 'ORG-X', email: 'test@org.com' }),
  }, 403);

  // Operator attempting Admin-only operation (DELETE /users/usr-1)
  await assertApi('B', 'Operator attempting DELETE /users/usr-1', '/users/usr-1', {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer demo-token-operator-1',
      'X-User-Role': 'Operator',
    },
  }, 403);

  // --------------------------------------------------------------------------
  // TEST SCENARIO C: Authenticated & Authorized User -> Request Succeeds (200/201)
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario C: Authorized Access Checks (200/201)...');

  // Admin GET /data-centers
  await assertApi('C', 'Admin GET /data-centers', '/data-centers', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
  }, 200);

  // Admin GET /dashboard/stats
  await assertApi('C', 'Admin GET /dashboard/stats', '/dashboard/stats', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Super Admin',
    },
  }, 200);

  // Network Engineer GET /servers
  await assertApi('C', 'Network Engineer GET /servers', '/servers', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer demo-token-neteng-1',
      'X-User-Role': 'Network Engineer',
    },
  }, 200);

  // --------------------------------------------------------------------------
  // TEST SCENARIO D: Input Validation Rejections -> 400 Bad Request
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario D: Input Validation Checks (400)...');

  // Malformed email in Client create
  await assertApi('D', 'Reject Malformed Email in Client POST', '/clients', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
    body: JSON.stringify({
      name: 'Acme Corp',
      email: 'not-a-valid-email', // INVALID EMAIL
      phone: '+91 9999999999',
    }),
  }, 400);

  // Invalid enum status in Server create
  await assertApi('D', 'Reject Invalid Status Enum in Server POST', '/servers', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
    body: JSON.stringify({
      assetTag: 'SRV-INVALID-STATUS',
      hostname: 'srv-test.dc.in',
      dataCenterId: 'dc-1',
      rackId: 'rack-1',
      status: 'HackedStatus', // INVALID STATUS
    }),
  }, 400);

  // Missing required fields
  await assertApi('D', 'Reject Missing Required Fields in DataCenter POST', '/data-centers', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
    body: JSON.stringify({
      // Missing name, code, city, state
      powerCapacityKw: 500,
    }),
  }, 400);

  // Obviously invalid numeric value (e.g. negative units or ram)
  await assertApi('D', 'Reject Negative Total Units in Rack POST', '/racks', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
    body: JSON.stringify({
      rackNumber: 'RK-INVALID-NUM',
      dataCenterId: 'dc-1',
      totalUnits: -10, // INVALID NEGATIVE NUMBER
    }),
  }, 400);

  // --------------------------------------------------------------------------
  // TEST SCENARIO E: Nonexistent Record Query -> 404 Not Found
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario E: Nonexistent Record Checks (404)...');

  // Unknown route
  await assertApi('E', 'Unknown API Route GET /api/nonexistent-route', '/nonexistent-route', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
    },
  }, 404);

  // --------------------------------------------------------------------------
  // TEST SCENARIO F: Normal Valid CRUD Lifecycle -> Succeeds
  // --------------------------------------------------------------------------
  console.log('▶ Running Scenario F: Valid CRUD Operation Lifecycle...');

  // Create valid client
  const clientPayload = {
    name: 'Security Test Corp',
    email: 'contact@sectestcorp.in',
    phone: '+91 22 2555 0199',
    billingType: 'Monthly',
    status: 'Active',
    slaTier: 'Standard',
  };

  const createRes = await assertApi('F', 'Valid Client Creation (POST /clients)', '/clients', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer demo-token-admin-1',
      'X-User-Role': 'Admin',
    },
    body: JSON.stringify(clientPayload),
  }, 201);

  const createdId = createRes.body?.data?.id;

  if (createdId) {
    // Read created client
    await assertApi('F', `Valid Client Fetch (GET /clients/${createdId})`, `/clients/${createdId}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer demo-token-admin-1',
        'X-User-Role': 'Admin',
      },
    }, 200);

    // Update client
    await assertApi('F', `Valid Client Update (PUT /clients/${createdId})`, `/clients/${createdId}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer demo-token-admin-1',
        'X-User-Role': 'Admin',
      },
      body: JSON.stringify({ name: 'Security Test Corp Updated' }),
    }, 200);

    // Delete client
    await assertApi('F', `Valid Client Cleanup (DELETE /clients/${createdId})`, `/clients/${createdId}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer demo-token-admin-1',
        'X-User-Role': 'Admin',
      },
    }, 200);
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('📊 TEST EXECUTION SUMMARY:');
  console.log('===============================================================');

  let passedCount = 0;
  for (const res of results) {
    const icon = res.passed ? '✅' : '❌';
    console.log(`${icon} [Scenario ${res.scenario}] ${res.name} -> HTTP ${res.actualStatus} (Expected: ${res.expectedStatus})`);
    if (res.passed) passedCount++;
  }

  console.log('===============================================================');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('===============================================================');

  if (passedCount === results.length) {
    console.log('🎉 ALL SECURITY & RBAC TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. INVESTIGATE ABOVE LOGS.');
  }
}

runSecuritySuite();
