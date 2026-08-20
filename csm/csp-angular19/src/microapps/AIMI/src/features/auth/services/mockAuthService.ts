import type { User } from '../context/authTypes';

// Mock user data - in real implementation, this would come from Google Auth
const MOCK_USERS: User[] = [
  {
    name: 'Admin User',
    email: 'admin@aimaturity.com',
    image: '',
  },
];

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const mockAuthService = {
  // Simulate Google Sign-In
  signInWithGoogle: async (): Promise<AuthResponse> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Randomly select a mock user (in real implementation, this would be the actual Google user)
      const randomUser = MOCK_USERS[0];

      return {
        success: true,
        user: randomUser,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to sign in with Google',
      };
    }
  },

  // Simulate Google Sign-Out
  signOut: async (): Promise<AuthResponse> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to sign out',
      };
    }
  },

  // Get current user (simulates checking if user is already signed in)
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // In real implementation, this would check Google Auth state
      // For now, return null to force login
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },
};
