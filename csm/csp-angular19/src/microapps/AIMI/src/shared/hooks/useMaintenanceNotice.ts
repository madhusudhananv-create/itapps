import { useEffect, useState } from 'react';
import { useAuth } from '@auth/hooks/useAuth';
import { aimiApiClient } from '@shared/services/aimiApiClient';

// Maintenance mode is driven by ONE CONFIGURATION_EXT row, so it can be switched on/off
// with a SQL update, with no code change or deploy:
//   KEY = 'AIMI_MAINTENANCE', VALUE = the message shown to users
//   ISACTIVE = 1 -> maintenance is on (access is blocked)
//   ISACTIVE = 0 -> maintenance is off
// The API (usp_AIMI_GetMaintenanceStatus) decides; the client only displays the result.
const MAINTENANCE_ENDPOINT = '/api/AllSys/GetAimiMaintenanceStatus';

const DEFAULT_MESSAGE =
  'AIMI is temporarily unavailable due to maintenance activities. Please try again after the maintenance activity is completed.';

interface MaintenanceStatusResponse {
  IS_MAINTENANCE_ACTIVE: boolean;
  MESSAGE?: string | null;
}

export interface MaintenanceState {
  isMaintenanceActive: boolean;
  message: string;
  /** False until the first check finishes, so the app does not flash before a block. */
  isChecked: boolean;
}

/**
 * Checks the maintenance status once the user is signed in. Any failure (network, auth)
 * is treated as "no maintenance" so a config problem can never lock users out.
 */
export const useMaintenanceNotice = (): MaintenanceState => {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<MaintenanceState>({
    isMaintenanceActive: false,
    message: DEFAULT_MESSAGE,
    isChecked: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const load = async () => {
      try {
        const status = await aimiApiClient.get<MaintenanceStatusResponse>(
          MAINTENANCE_ENDPOINT
        );
        if (!cancelled) {
          setState({
            isMaintenanceActive: status?.IS_MAINTENANCE_ACTIVE === true,
            message: status?.MESSAGE?.trim() || DEFAULT_MESSAGE,
            isChecked: true,
          });
        }
      } catch (error) {
        console.warn('Could not load AIMI maintenance status:', error);
        if (!cancelled) {
          setState((prev) => ({ ...prev, isChecked: true }));
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return state;
};
