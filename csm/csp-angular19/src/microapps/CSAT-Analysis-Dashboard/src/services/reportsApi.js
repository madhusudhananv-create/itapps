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

// Styled modal (not a native window.alert) explaining why we're about to redirect, so the
// bounce to /login doesn't look unexplained. Clicking OK performs the redirect.
function showLoginRequiredPopup(redirectUrl) {
  if (typeof document === 'undefined') {
    window.location.href = redirectUrl;
    return;
  }
  if (document.getElementById('csat-login-required-overlay')) return; // already shown

  const overlay = document.createElement('div');
  overlay.id = 'csat-login-required-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:#ffffff;border-radius:14px;padding:2rem 2.25rem;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.35);text-align:center;';

  const title = document.createElement('h3');
  title.textContent = 'Login Required';
  title.style.cssText = 'margin:0 0 0.75rem;font-size:1.2rem;font-weight:700;color:#1f2937;';

  const message = document.createElement('p');
  message.textContent = "You're not logged in. Click OK to log in to the CSM Platform Home screen, then open this app from Integrated Apps in the navbar.";
  message.style.cssText = 'margin:0 0 1.75rem;font-size:0.95rem;line-height:1.5;color:#4b5563;';

  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.style.cssText = 'background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;border:none;border-radius:8px;padding:0.65rem 2.5rem;font-size:0.9rem;font-weight:600;cursor:pointer;';
  okButton.onclick = () => {
    window.location.href = redirectUrl;
  };

  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(okButton);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// This microapp has no login screen or session check of its own — it's a static bundle
// that can be reached directly (bypassing the Angular shell's route guard) with no valid
// session in localStorage. When that happens, GetCustomerIds has no empId/token to act on
// and the dashboard would otherwise render with an empty customer list and no explanation.
// Show a popup explaining why before navigating away, then send the user to the same
// same-origin /login route the Angular app itself navigates to (see e.g. app.component.ts,
// auth.guard.ts: router.navigateByUrl('/login')).
function redirectToLogin() {
  if (typeof window === 'undefined') return;
  showLoginRequiredPopup('/login');
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
  if (!empId) {
    redirectToLogin();
    throw new Error('GetCustomerIds: no session found — redirecting to login.');
  }
  const res = await fetch(`${resolveApiBase()}GetCustomerIds?EmpId=${empId}&istoFindSLA=false`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    redirectToLogin();
    throw new Error(`GetCustomerIds unauthorized: ${res.status} — redirecting to login.`);
  }
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
  if (!empId) {
    redirectToLogin();
    throw new Error('GetCustomerIds: no session found — redirecting to login.');
  }
  const res = await fetch(`${resolveApiBase()}GetCustomerIds?EmpId=${empId}&istoFindSLA=false`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    redirectToLogin();
    throw new Error(`GetCustomerIds unauthorized: ${res.status} — redirecting to login.`);
  }
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
