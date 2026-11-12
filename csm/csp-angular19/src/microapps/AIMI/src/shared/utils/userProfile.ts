import { getApiUrl } from '@shared/config/apiConfig';

// The CSM login session only carries empid / displayname / role id in localStorage - never the
// employee's e-mail or a role name. The profile menu should show name, e-mail and role (not the
// emp id), so resolve them here. empid itself stays in localStorage for access-control/API use.

// Mirrors enumRoles in the Angular app (src/app/shared/enum.ts)
const ROLE_NAMES: Record<string, string> = {
  '1': 'Customer Success Manager',
  '2': 'Project Manager',
  '3': 'Team Member',
  '4': 'BU Head',
  '5': 'Customer',
  '6': 'PMO',
  '7': 'Quality',
  '8': 'Finance',
  '9': 'Functional Manager',
  '10': 'HR',
  '11': 'Account Manager',
  '12': 'Marketing',
  '13': 'GS Lab',
};

export const getCurrentRoleName = (): string =>
  ROLE_NAMES[localStorage.getItem('role') || ''] ?? '';

const cacheKey = (empId: string) => `aimi_user_email_${empId}`;

const readEmpId = (row: Record<string, unknown>): string =>
  String(row?.empid ?? row?.EMPID ?? row?.emP_ID ?? row?.EMP_ID ?? '');

const readEmail = (row: Record<string, unknown>): string =>
  String(row?.emaiL_ID ?? row?.EMAIL_ID ?? row?.email ?? '');

/** Synchronous best guess: cached e-mail, or empid itself when it already is an e-mail (customer logins). */
export const getCachedUserEmail = (): string => {
  const empId = localStorage.getItem('empid') || '';
  if (!empId) return '';
  if (empId.includes('@')) return empId.toLowerCase();
  try {
    return sessionStorage.getItem(cacheKey(empId)) || '';
  } catch {
    return '';
  }
};

/**
 * Resolves the logged-in employee's e-mail from the global employee roster (/api/AllSys/EmpInfo),
 * the same lookup the IT-Ops Maturity microapp uses. Result is cached per session.
 */
export const fetchCurrentUserEmail = async (): Promise<string> => {
  const cached = getCachedUserEmail();
  if (cached) return cached;

  const empId = localStorage.getItem('empid') || '';
  if (!empId) return '';

  try {
    const response = await fetch(getApiUrl('/api/AllSys/EmpInfo'), {
      headers: {
        Accept: 'application/json',
        token: localStorage.getItem('token') || '',
        empId,
      },
    });
    if (!response.ok) return '';
    const rows = (await response.json()) as Record<string, unknown>[];
    const match = Array.isArray(rows)
      ? rows.find((row) => readEmpId(row) === empId)
      : undefined;
    const email = match ? readEmail(match).toLowerCase() : '';
    if (email) {
      try {
        sessionStorage.setItem(cacheKey(empId), email);
      } catch {
        // storage unavailable - just skip caching
      }
    }
    return email;
  } catch (error) {
    console.error('Failed to resolve user e-mail from EmpInfo:', error);
    return '';
  }
};
