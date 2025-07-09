import { apiConfig, buildUrl, getAuthHeaders } from '@/config/api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// interface AuthState {
// 	user: User | null;
// 	token: string | null;
// 	isLoading: boolean;
// 	error: string | null;
// }

// Auth store
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isGuest = computed(() => !isAuthenticated.value);
  const userDisplayName = computed(() => user.value?.username || 'Guest');

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(buildUrl(apiConfig.ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: getAuthHeaders(token.value ?? undefined),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      token.value = data.token;
      user.value = data.user;

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);

      // Clear any previous errors
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      // Reset state on failure
      user.value = null;
      token.value = null;
      localStorage.removeItem('auth_token');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(buildUrl(apiConfig.ENDPOINTS.AUTH.REGISTER), {
        method: 'POST',
        headers: getAuthHeaders(token.value ?? undefined),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      token.value = data.token;
      user.value = data.user;

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);

      // Clear any previous errors
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed';
      // Reset state on failure
      user.value = null;
      token.value = null;
      localStorage.removeItem('auth_token');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Call logout endpoint if token exists
      if (token.value) {
        await fetch(buildUrl(apiConfig.ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: getAuthHeaders(token.value ?? undefined),
        });
      }
    } catch (err) {
      // Don't throw error on logout - just log it
      console.warn('Logout API call failed:', err);
    } finally {
      // Clear local state regardless of API call success
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      error.value = null;
      isLoading.value = false;
    }
  };

  const fetchUser = async (): Promise<void> => {
    if (!token.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(buildUrl(apiConfig.ENDPOINTS.USER.PROFILE), {
        headers: getAuthHeaders(token.value ?? undefined),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear auth state
          await logout();
          return;
        }
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      user.value = userData;
      error.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user profile';
      // Don't throw - just set error state
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  const $reset = (): void => {
    user.value = null;
    token.value = null;
    isLoading.value = false;
    error.value = null;
    localStorage.removeItem('auth_token');
  };

  // Initialize user data if token exists
  if (token.value) {
    fetchUser();
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isGuest,
    userDisplayName,

    // Actions
    login,
    register,
    logout,
    fetchUser,
    clearError,
    $reset,
  };
});
