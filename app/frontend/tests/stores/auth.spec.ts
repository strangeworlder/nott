import { useAuthStore } from '@/stores/auth';
import {
  createMockToken,
  createMockUser,
  mockFetch,
  mockLocalStorage,
} from '@/tests/utils/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Auth Store', () => {
  let store: ReturnType<typeof useAuthStore>;
  let mockFetchFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup Pinia
    setActivePinia(createPinia());
    store = useAuthStore();

    // Mock fetch
    mockFetchFn = mockFetch({});
    global.fetch = mockFetchFn;

    // Mock localStorage
    mockLocalStorage();

    // Reset store state
    store.$reset();
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });

    it('has correct computed properties', () => {
      expect(store.isAuthenticated).toBe(false);
      expect(store.isGuest).toBe(true);
      expect(store.userDisplayName).toBe('Guest');
    });
  });

  describe('Login', () => {
    it('successfully logs in user', async () => {
      const mockUser = createMockUser();
      const mockToken = createMockToken();

      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          token: mockToken,
          user: mockUser,
        }),
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await store.login(credentials);

      expect(store.user).toEqual(mockUser);
      expect(store.token).toBe(mockToken);
      expect(store.isAuthenticated).toBe(true);
      expect(store.isGuest).toBe(false);
      expect(store.userDisplayName).toBe(mockUser.username);
      expect(store.error).toBe(null);
      expect(store.isLoading).toBe(false);
    });

    it('handles login failure', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({
          message: 'Invalid credentials',
        }),
      });

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(store.login(credentials)).rejects.toThrow('Invalid credentials');

      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.error).toBe('Invalid credentials');
      expect(store.isLoading).toBe(false);
    });

    it('handles network errors', async () => {
      mockFetchFn.mockRejectedValueOnce(new Error('Network error'));

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(store.login(credentials)).rejects.toThrow('Network error');

      expect(store.error).toBe('Network error');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Register', () => {
    it('successfully registers user', async () => {
      const mockUser = createMockUser();
      const mockToken = createMockToken();

      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue({
          token: mockToken,
          user: mockUser,
        }),
      });

      const credentials = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      await store.register(credentials);

      expect(store.user).toEqual(mockUser);
      expect(store.token).toBe(mockToken);
      expect(store.isAuthenticated).toBe(true);
      expect(store.error).toBe(null);
      expect(store.isLoading).toBe(false);
    });

    it('handles registration failure', async () => {
      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: vi.fn().mockResolvedValue({
          message: 'Username already exists',
        }),
      });

      const credentials = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      await expect(store.register(credentials)).rejects.toThrow('Username already exists');

      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.error).toBe('Username already exists');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('successfully logs out user', async () => {
      // Setup authenticated state
      store.user = createMockUser();
      store.token = createMockToken();

      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({}),
      });

      await store.logout();

      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.isGuest).toBe(true);
      expect(store.error).toBe(null);
      expect(store.isLoading).toBe(false);
    });

    it('handles logout API failure gracefully', async () => {
      // Setup authenticated state
      store.user = createMockUser();
      store.token = createMockToken();

      mockFetchFn.mockRejectedValueOnce(new Error('Network error'));

      await store.logout();

      // Should still clear local state even if API fails
      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Fetch User', () => {
    it('successfully fetches user profile', async () => {
      const mockUser = createMockUser();
      store.token = createMockToken();

      mockFetchFn.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockUser),
      });

      await store.fetchUser();

      expect(store.user).toEqual(mockUser);
      expect(store.error).toBe(null);
      expect(store.isLoading).toBe(false);
    });

    it('handles unauthorized response', async () => {
      store.token = createMockToken();

      mockFetchFn.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({}),
      });

      await store.fetchUser();

      // Should logout on 401
      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isAuthenticated).toBe(false);
    });

    it('does nothing when no token exists', async () => {
      store.token = null;
      store.user = null;

      await store.fetchUser();

      expect(store.user).toBe(null);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('clears error when clearError is called', () => {
      store.error = 'Some error';
      store.clearError();
      expect(store.error).toBe(null);
    });

    it('resets store state', () => {
      // Setup some state
      store.user = createMockUser();
      store.token = createMockToken();
      store.isLoading = true;
      store.error = 'Some error';

      store.$reset();

      expect(store.user).toBe(null);
      expect(store.token).toBe(null);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
    });
  });

  describe('Computed Properties', () => {
    it('correctly computes isAuthenticated', () => {
      expect(store.isAuthenticated).toBe(false);

      store.user = createMockUser();
      store.token = createMockToken();

      expect(store.isAuthenticated).toBe(true);
    });

    it('correctly computes isGuest', () => {
      expect(store.isGuest).toBe(true);

      store.user = createMockUser();
      store.token = createMockToken();

      expect(store.isGuest).toBe(false);
    });

    it('correctly computes userDisplayName', () => {
      expect(store.userDisplayName).toBe('Guest');

      store.user = createMockUser({ username: 'testuser' });

      expect(store.userDisplayName).toBe('testuser');
    });
  });
});
