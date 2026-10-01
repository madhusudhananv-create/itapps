import { getApiUrl } from '@shared/config/apiConfig';

// Thin fetch wrapper for the SQL-backed AllSys API (AimiController), generalizing
// the token/empId header pattern already proven in
// shared/projects/hooks/useAllocatedAccounts.ts (GetCustomerIds) so every new
// AIMI-to-SQL service call is a one-liner instead of hand-rolled fetch boilerplate.

type QueryParams = Record<string, string | number | boolean | undefined | null>;

const buildHeaders = (): HeadersInit => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  token: localStorage.getItem('token') || '',
  empId: localStorage.getItem('empid') || '',
});

const buildUrl = (endpoint: string, params?: QueryParams): string => {
  const url = getApiUrl(endpoint);
  if (!params) return url;

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${url}?${query}` : url;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AIMI API request failed (${response.status}): ${text || response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};

/** empId of the current bridged CSM session, for CREATED_BY/UPDATED_BY stamping. */
export const getCurrentEmpId = (): string => localStorage.getItem('empid') || '';

export const aimiApiClient = {
  get: async <T>(endpoint: string, params?: QueryParams): Promise<T> => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'GET',
      headers: buildHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    const response = await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },
};
