# Auth Store - Design System Integration

## Overview

The auth store follows the design system patterns established in the NotT application, providing a consistent, type-safe, and reusable authentication solution.

## Design System Patterns

### 1. **TypeScript-First Approach**

```typescript
// Strict type definitions following design system patterns
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
```

### 2. **Composition API with Pinia**

```typescript
// Using Composition API with proper reactive state management
export const useAuthStore = defineStore('auth', () => {
  // State - reactive refs for primitive values
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters - computed properties for derived state
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isGuest = computed(() => !isAuthenticated.value);
  const userDisplayName = computed(() => user.value?.username || 'Guest');

  // Actions - async operations with proper error handling
  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Implementation follows design system error handling patterns
  };

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
```

### 3. **Error Handling Patterns**

Following the design system's error handling approach:

```typescript
const login = async (credentials: LoginCredentials): Promise<void> => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: API_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    token.value = data.token;
    user.value = data.user;
    localStorage.setItem('auth_token', data.token);
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed';
    throw err;
  } finally {
    isLoading.value = false;
  }
};
```

### 4. **Loading State Management**

Consistent loading state patterns used throughout the design system:

```typescript
// Loading state for async operations
const isLoading = ref(false);

// Usage in actions
const someAction = async () => {
  isLoading.value = true;
  try {
    // Async operation
  } finally {
    isLoading.value = false;
  }
};
```

### 5. **Persistence Integration**

Following design system patterns for data persistence:

```typescript
// Token persistence with localStorage
const token = ref<string | null>(localStorage.getItem('auth_token'));

// Automatic token storage on login
localStorage.setItem('auth_token', data.token);

// Token cleanup on logout
localStorage.removeItem('auth_token');
```

## Usage Examples

### Basic Usage

```typescript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Check authentication status
if (authStore.isAuthenticated) {
  console.log('User is logged in:', authStore.userDisplayName);
}

// Login
await authStore.login({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await authStore.logout();
```

### Component Integration

```vue
<template>
  <div>
    <!-- Loading state -->
    <BaseButton 
      :loading="authStore.isLoading"
      @click="handleLogin"
    >
      Sign In
    </BaseButton>

    <!-- Error display -->
    <BaseText 
      v-if="authStore.error" 
      color="danger"
    >
      {{ authStore.error }}
    </BaseText>

    <!-- User info -->
    <BaseText v-if="authStore.isAuthenticated">
      Welcome, {{ authStore.userDisplayName }}
    </BaseText>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/ui/design-system/atoms/BaseButton.vue';
import BaseText from '@/components/ui/design-system/atoms/BaseText.vue';

const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    await authStore.login({
      email: 'user@example.com',
      password: 'password123'
    });
  } catch (error) {
    // Error is handled by the store
  }
};
</script>
```

## Design System Benefits

### 1. **Type Safety**
- All interfaces are strictly typed
- TypeScript enforces correct usage
- IntelliSense support for all properties

### 2. **Consistent Patterns**
- Follows the same patterns as other design system components
- Consistent error handling approach
- Standard loading state management

### 3. **Reusability**
- Can be used across all components
- Consistent API across the application
- Easy to test and maintain

### 4. **Integration Ready**
- Works seamlessly with design system components
- Supports all BaseButton loading states
- Integrates with BaseText for error display

## Testing Patterns

```typescript
// Example test following design system patterns
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should handle login successfully', async () => {
    const authStore = useAuthStore();
    
    await authStore.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.user).toBeDefined();
  });
});
```

## Future Enhancements

The auth store is designed to be extensible for future design system features:

1. **Refresh Token Support** - For enhanced security
2. **Multi-factor Authentication** - For production security
3. **Social Login Integration** - For user convenience
4. **Offline Support** - For better UX
5. **Analytics Integration** - For user behavior tracking

## Conclusion

The auth store successfully implements all design system patterns and provides a solid foundation for authentication throughout the NotT application. It's type-safe, consistent, and ready for production use. 