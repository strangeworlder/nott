# Testing Guide for NotT Frontend

This document outlines the testing strategy and patterns used in the NotT frontend application.

## Testing Framework

We use **Vitest** as our primary testing framework with the following setup:

- **Unit Testing**: Vitest with Vue Test Utils
- **Component Testing**: Vue Test Utils for component isolation
- **Coverage**: V8 coverage provider with HTML reports
- **Environment**: jsdom for DOM simulation

## Test Structure

```
tests/
├── components/           # Component tests
│   ├── layout/         # Layout component tests
│   └── ui/             # UI component tests
├── stores/             # Pinia store tests
├── composables/        # Composable function tests
└── utils/              # Test utilities

src/tests/
├── setup.ts            # Global test setup
└── utils/              # Test utilities
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
```

## Test Patterns

### Component Testing

```typescript
import { describe, expect, it } from 'vitest';
import { mountComponent } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mountComponent(MyComponent, {
      props: { title: 'Test' },
      slots: { default: 'Content' },
    });

    expect(wrapper.text()).toContain('Test');
    expect(wrapper.text()).toContain('Content');
  });

  it('emits events', async () => {
    const wrapper = mountComponent(MyComponent);
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.emitted('click')).toBeTruthy();
  });
});
```

### Store Testing

```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMyStore } from '@/stores/myStore';
import { mockFetch } from '@/tests/utils/test-utils';

describe('MyStore', () => {
  let store: ReturnType<typeof useMyStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMyStore();
  });

  it('has correct initial state', () => {
    expect(store.items).toEqual([]);
    expect(store.isLoading).toBe(false);
  });

  it('fetches data successfully', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    global.fetch = mockFetch(mockData);

    await store.fetchItems();

    expect(store.items).toEqual(mockData);
    expect(store.isLoading).toBe(false);
  });
});
```

### Composable Testing

```typescript
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useMyComposable } from '@/composables/useMyComposable';

describe('useMyComposable', () => {
  it('returns expected values', () => {
    const { count, increment } = useMyComposable();

    expect(count.value).toBe(0);
    
    increment();
    expect(count.value).toBe(1);
  });
});
```

## Test Utilities

### mountComponent

A utility function that mounts components with common test configuration:

```typescript
const wrapper = mountComponent(MyComponent, {
  props: { title: 'Test' },
  slots: { default: 'Content' },
  global: {
    plugins: [pinia],
  },
});
```

### Mock Functio 