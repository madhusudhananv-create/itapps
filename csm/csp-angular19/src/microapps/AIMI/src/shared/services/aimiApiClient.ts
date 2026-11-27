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
  // Some endpoints (e.g. DeleteAimiActivity, the log endpoints) return 200 with no body
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

/** empId of the current bridged CSM session, for CREATED_BY/UPDATED_BY stamping. */
export const getCurrentEmpId = (): string => localStorage.getItem('empid') || '';

const LOG_ENDPOINTS = {
  USER_ACTIVITY: '/api/AllSys/LogAimiUserActivity',
  ERROR: '/api/AllSys/LogAimiError',
};

/**
 * Fire-and-forget POST used for usage/error logging. It never throws and never
 * reports its own failures, so logging can't break the app or loop on itself.
 * The server resolves the user's e-mail from the empId header.
 */
const postQuietly = async (endpoint: string, body: unknown): Promise<void> => {
  try {
    await fetch(buildUrl(endpoint), {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    // intentionally ignored
  }
};

// Every failed AIMI API call (HTTP error or network failure) is recorded in
// AIMI_ERROR_LOG, then rethrown unchanged for the caller to handle as before.
const reportApiError = (method: string, endpoint: string, error: unknown) => {
  if (
    endpoint === LOG_ENDPOINTS.USER_ACTIVITY ||
    endpoint === LOG_ENDPOINTS.ERROR
  ) {
    return;
  }
  const err = error instanceof Error ? error : new Error(String(error));
  void postQuietly(LOG_ENDPOINTS.ERROR, {
    MODULE: 'API',
    ACTION: `${method} ${endpoint.split('/').pop()}`,
    REQUEST_URL: endpoint,
    ERROR_MESSAGE: err.message,
    EXCEPTION_TYPE: err.name,
    STACK_TRACE: err.stack,
  });
};

export const aimiApiClient = {
  get: async <T>(endpoint: string, params?: QueryParams): Promise<T> => {
    try {
      const response = await fetch(buildUrl(endpoint, params), {
        method: 'GET',
        headers: buildHeaders(),
      });
      return await handleResponse<T>(response);
    } catch (error) {
      reportApiError('GET', endpoint, error);
      throw error;
    }
  },

  post: async <T>(endpoint: string, body?: unknown): Promise<T> => {
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: buildHeaders(),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return await handleResponse<T>(response);
    } catch (error) {
      reportApiError('POST', endpoint, error);
      throw error;
    }
  },

  /** Quiet POST for logging calls - see postQuietly. */
  postQuietly,
};

export { LOG_ENDPOINTS };
