import { aimiApiClient, LOG_ENDPOINTS } from '@shared/services/aimiApiClient';

// Login and error logging into AIMI_USER_ACTIVITY_LOG / AIMI_ERROR_LOG. The user is
// identified server-side (empId header -> e-mail from EMP_INFO), so callers only say
// what happened. Only logins are recorded as user activity (no per-page or per-action rows). Every function is fire-and-forget and never throws.

export type AimiLogModule = 'Auth' | 'Activities' | 'Reports';

interface UserActivityEvent {
  module: AimiLogModule;
  action: string;
  projectId?: string;
  practice?: string;
}

export const logUserActivity = ({
  module,
  action,
  projectId,
  practice,
}: UserActivityEvent): void => {
  void aimiApiClient.postQuietly(LOG_ENDPOINTS.USER_ACTIVITY, {
    MODULE: module,
    ACTION: action,
    PROJECT_ID: projectId || null,
    PRACTICE: practice || null,
    REQUEST_URL: window.location.pathname,
  });
};

/** Record an error caught in the UI (API failures are already logged by aimiApiClient). */
export const logError = (
  module: AimiLogModule,
  action: string,
  error: unknown
): void => {
  const err = error instanceof Error ? error : new Error(String(error));
  void aimiApiClient.postQuietly(LOG_ENDPOINTS.ERROR, {
    MODULE: module,
    ACTION: action,
    REQUEST_URL: window.location.pathname,
    ERROR_MESSAGE: err.message,
    EXCEPTION_TYPE: err.name,
    STACK_TRACE: err.stack,
  });
};
