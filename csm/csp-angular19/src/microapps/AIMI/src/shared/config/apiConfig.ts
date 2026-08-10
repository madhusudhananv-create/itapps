export const API_CONFIG = {
  BASE_URL: import.meta.env.AIMI_API_BASE_URL,
  ENDPOINTS: {
    PROJECTS: '/api/auth/GetProjectListTemp',
  },
  TIMEOUT: parseInt(import.meta.env.AIMI_API_TIMEOUT), // 10 seconds timeout
} as const;

export const getApiUrl = (
  endpoint: string = API_CONFIG.ENDPOINTS.PROJECTS
): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
};
