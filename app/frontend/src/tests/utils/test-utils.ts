import { type VueWrapper, mount } from '@vue/test-utils';
import type { ComponentMountingOptions } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { vi } from 'vitest';
import type { Component } from 'vue';

// Import components for global registration
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';

// Global components for testing
const globalComponents = {
  BaseText,
};

// Mock fetch function
export function mockFetch(data: unknown, status = 200, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  });
}

// Mock fetch with error
export function mockFetchError(error: string, _status = 500) {
  return vi.fn().mockRejectedValue(new Error(error));
}

// Create mock user data
export function createMockUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Create mock auth token
export function createMockToken() {
  return 'mock-jwt-token-123';
}

// Component mounting utility
export function mountComponent<T extends Component>(
  component: T,
  options: ComponentMountingOptions<Record<string, unknown>> = {}
): VueWrapper<T> {
  const pinia = createPinia();
  setActivePinia(pinia);

  return mount(component, {
    global: {
      plugins: [pinia],
      components: globalComponents,
      stubs: {
        // Stub router components
        'router-link': true,
        'router-view': true,
        // Stub external components that might not be available in tests
        AppNavigation: true,
      },
    },
    ...options,
  } as ComponentMountingOptions<T>);
}

// Mock store state
export function mockStoreState<T extends Record<string, unknown>>(state: T): T {
  return { ...state };
}

// Mock API response
export function mockApiResponse<T>(data: T, status = 200): unknown {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

// Mock API error
export function mockApiError(message: string, status = 500): unknown {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({ error: message }),
    text: vi.fn().mockResolvedValue(JSON.stringify({ error: message })),
  };
}

// Wait for next tick
export async function waitForNextTick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Wait for component to update
export async function waitForUpdate(wrapper: VueWrapper): Promise<void> {
  await wrapper.vm.$nextTick();
}

// Mock localStorage
export function mockLocalStorage(): void {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      }),
    },
    writable: true,
  });
}

// Mock sessionStorage
export function mockSessionStorage(): void {
  const store: Record<string, string> = {};

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      }),
    },
    writable: true,
  });
}

// Mock console methods
export function mockConsole(): void {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

// Reset all mocks
export function resetMocks(): void {
  vi.clearAllMocks();
  vi.clearAllTimers();
}
