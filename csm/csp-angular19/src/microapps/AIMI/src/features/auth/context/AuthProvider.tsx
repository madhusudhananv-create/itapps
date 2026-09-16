import {
  useState,
  useEffect,
  type ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { AuthContext } from './AuthContext';
import type { User } from './authTypes';
import { authStorage } from '@auth/utils';
import { mockAuthService } from '@auth/services';

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const authState = authStorage.getAuthState();
        const storedUser = authStorage.getUser();

        if (authState?.isAuthenticated && storedUser) {
          setIsAuthenticated(true);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        // Clear corrupted data
        authStorage.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate Google Sign-In
      const response = await mockAuthService.signInWithGoogle();

      if (response.success && response.user) {
        // Save to localStorage
        authStorage.saveAuthState(true);
        authStorage.saveUser(response.user);

        // Update state
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        throw new Error(response.error ?? 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate Google Sign-Out
      await mockAuthService.signOut();

      // Clear localStorage
      authStorage.clearAuth();

      // Update state
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the service call fails, clear local state
      authStorage.clearAuth();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      login,
      logout,
      isLoading,
    }),
    [isAuthenticated, user, login, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
