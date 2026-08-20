import type { User } from '../context/authTypes';

const AUTH_STORAGE_KEY = 'ai_maturity_auth';
const USER_STORAGE_KEY = 'ai_maturity_user';

export interface AuthStorageData {
  isAuthenticated: boolean;
  timestamp: number;
}

export const authStorage = {
  // Save authentication state
  saveAuthState: (isAuthenticated: boolean): void => {
    try {
      const authData: AuthStorageData = {
        isAuthenticated,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to save auth state to localStorage:', error);
    }
  },

  // Get authentication state
  getAuthState: (): AuthStorageData | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const authData: AuthStorageData = JSON.parse(stored);

      // Check if the session is still valid (24 hours)
      const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        authStorage.clearAuth();
        return null;
      }

      return authData;
    } catch (error) {
      console.error('Failed to get auth state from localStorage:', error);
      return null;
    }
  },

  // Save user data
  saveUser: (user: User): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  },

  // Get user data
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to get user from localStorage:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuth: (): void => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const authState = authStorage.getAuthState();
    return authState?.isAuthenticated ?? false;
  },
};
