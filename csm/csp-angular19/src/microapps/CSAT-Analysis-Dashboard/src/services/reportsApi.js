// Generic client for the CSM backend's dynamic Reports-SP pipeline
// (GetAllSps / GetSpParams / GetSpData) — mirrors csp-angular19's AppsService.

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.__CSAT_API_BASE__) {
    return window.__CSAT_API_BASE__;
  }
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:53505/api/AllSys/';
  }
  if (host.includes('uat') || host.includes('test')) {
    return 'https://csmuatapi.neurealm.com/api/AllSys/';
  }
  return 'https://csmapi.neurealm.com/api/AllSys/';
}

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem('token') || '';
  const empId = localStorage.getItem('empid') || '';
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    token,
    empId,
    ...extra,
  };
}

// Resolves the "All customers" filter into a comma-joined list of the
// logged-in employee's accessible customer IDs — mirrors reports.component.ts,
// which never sends a literal "-1"/"all" sentinel to the SP.
export async function getAllAccessibleCustomerIds() {
  const cached = localStorage.getItem('CustomerIds');
  if (cached && cached.trim() !== '') {
    try {
      const parsed = JSON.parse(cached);
      const ids = parsed.map(c => c.cusT_ID ?? c.CUST_ID).filter(id => id !== undefined && id !== null);
      if (ids.length > 0) return ids.join(',');
    } catch (e) {
      console.error('[reportsApi] Failed to parse cached CustomerIds:', e);
    }
  }

  const empId = localStorage.getItem('empid') || '';
  const res = await fetch(`${resolveApiBase()}GetCustomerIds?EmpId=${empId}&istoFindSLA=false`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`GetCustomerIds failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .map(c => c.cusT_ID ?? c.CUST_ID)
    .filter(id => id !== undefined && id !== null)
    .join(',');
}

// Returns [{ id, name }] for the logged-in employee's accessible customers,
// for populating a Customer dropdown. Same source as getAllAccessibleCustomerIds.
export async function getAllAccessibleCustomers() {
  const empId = localStorage.getItem('empid') || '';
  const res = await fetch(`${resolveApiBase()}GetCustomerIds?EmpId=${empId}&istoFindSLA=false`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`GetCustomerIds failed: ${res.status}`);
  const data = await res.json();
  return (Array.isArray(data) ? data : [])
    .map(c => ({
      id: c.cusT_ID ?? c.CUST_ID,
      name: c.cusT_NM ?? c.CUST_NM ?? c.cusT_ID ?? c.CUST_ID,
    }))
    .filter(c => c.id !== undefined && c.id !== null)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export async function getAllSps() {
  const res = await fetch(`${resolveApiBase()}GetAllSps`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`GetAllSps failed: ${res.status}`);
  return res.json();
}

export async function getSpParams(spId) {
  const res = await fetch(`${resolveApiBase()}GetSpParams?SpId=${spId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`GetSpParams failed: ${res.status}`);
  return res.json();
}

export async function getSpData(spName, params) {
  const res = await fetch(`${resolveApiBase()}GetSpData`, {
    method: 'POST',
    headers: getAuthHeaders({ spname: spName }),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`GetSpData failed for ${spName}: ${res.status}`);
  return res.json();
}

function normalizeSpName(name) {
  return name.replace(/^dbo\./i, '').toLowerCase();
}

// Known REPORTS_SP_DETAILS.ID values for the 4 PCSAT report SPs, confirmed
// against the live DB. Using these avoids a GetAllSps round-trip on every
// fetch. If a name isn't in this map (e.g. a new report, or the ID differs
// on another environment), fetchReportData falls back to the dynamic
// GetAllSps lookup so this never becomes a hard dependency.
const KNOWN_SP_IDS = {
  'reports_getcssinitateddetails': 6,   // "Customer Success Survey Status"
  'reports_csat_combined': 48,          // "Customer Success Survey Report All A/C– PCSAT"
  'reports_csat_halfyearly': 64,        // "Customer Success Survey Report All A/C– ACSAT"
  'reports_getacsatcustomersuccesssurvey': 70, // "ACSAT Survey Status Report"
};

async function resolveSpDetail(spName) {
  const knownId = KNOWN_SP_IDS[normalizeSpName(spName)];
  if (knownId) {
    return { id: knownId, sP_NAME: spName };
  }
  const allSps = await getAllSps();
  const spDetail = allSps.find(s => normalizeSpName(s.sP_NAME) === normalizeSpName(spName));
  if (!spDetail) {
    console.error('[reportsApi] Available SPs were:', allSps.map(s => s.sP_NAME));
    throw new Error(`Report SP not found in REPORTS_SP_DETAILS: ${spName}`);
  }
  return spDetail;
}

// Looks up a report by its REPORTS_SP_DETAILS.SP_NAME, fills in its
// StartDate/EndDate/Customer params, and executes it via GetSpData.
export async function fetchReportData(spName, { startDate, endDate, customerIds }) {
  const spDetail = await resolveSpDetail(spName);
  console.log(`[reportsApi] Using SP "${spName}" -> id ${spDetail.id}`);

  const params = await getSpParams(spDetail.id);
  console.log(`[reportsApi] Raw params for SP ${spDetail.id} (${spDetail.sP_NAME}):`, JSON.parse(JSON.stringify(params)));

  const isUnsetOrAll = !customerIds || customerIds === '-1';
  const needsCustomerIds = isUnsetOrAll && params.some(p => p.paraM_TYPE === 'CUSTOMERID');
  const resolvedCustomerIds = needsCustomerIds ? await getAllAccessibleCustomerIds() : customerIds;
  console.log(`[reportsApi] Resolved customer id list:`, resolvedCustomerIds);

  params.forEach(p => {
    if (p.paraM_TYPE === 'DATE' && /start/i.test(p.paraM_NAME)) {
      p.paraM_VALUE = startDate;
    } else if (p.paraM_TYPE === 'DATE' && /end/i.test(p.paraM_NAME)) {
      p.paraM_VALUE = endDate;
    } else if (p.paraM_TYPE === 'CUSTOMERID') {
      p.paraM_VALUE = resolvedCustomerIds || '-1';
    }
  });
  console.log(`[reportsApi] Final params being posted for ${spDetail.sP_NAME}:`, params);

  const result = await getSpData(spDetail.sP_NAME, params);
  console.log(`[reportsApi] Raw GetSpData response for ${spDetail.sP_NAME} (isArray=${Array.isArray(result)}, length=${result?.length}):`, result);
  return result;
}
