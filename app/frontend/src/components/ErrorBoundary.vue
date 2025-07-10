<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">
        We're sorry, but something unexpected happened. Our team has been notified.
      </p>
      <button @click="resetError" class="error-button">
        Try Again
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { environment } from '@/config/environment';
import { onErrorCaptured, ref } from 'vue';

const error = ref<Error | null>(null);

// Capture Vue errors
onErrorCaptured((err: Error, instance: unknown, info: string) => {
  error.value = err;

  // Report to Sentry if available and DSN is provided
  if (environment.SENTRY_DSN && environment.SENTRY_DSN.trim() !== '' && typeof window !== 'undefined') {
    try {
      // Dynamic import to avoid build issues
      import('@sentry/vue')
        .then((Sentry) => {
          Sentry.captureException(err, {
            extra: {
              component:
                (instance as { $options?: { name?: string } })?.$options?.name || 'Unknown',
              info,
              url: window.location.href,
            },
          });
        })
        .catch(() => {
          // Silently fail if Sentry is not available
          console.error('Failed to report error to Sentry:', err);
        });
    } catch (sentryError) {
      console.error('Sentry error reporting failed:', sentryError);
    }
  }

  // Log to console in development
  if (environment.ENABLE_DEBUG) {
    console.error('Error captured by boundary:', err);
    console.error('Component info:', info);
  }

  return false; // Prevent error from propagating
});

// Reset error state
const resetError = () => {
  error.value = null;
};

// Explicitly expose functions for template
defineExpose({
  resetError,
});

// Handle global errors only if Sentry is configured
if (typeof window !== 'undefined' && environment.SENTRY_DSN && environment.SENTRY_DSN.trim() !== '') {
  window.addEventListener('error', (event) => {
    try {
      import('@sentry/vue')
        .then((Sentry) => {
          Sentry.captureException(event.error, {
            extra: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            },
          });
        })
        .catch(() => {
          console.error('Failed to report global error to Sentry:', event.error);
        });
    } catch (sentryError) {
      console.error('Sentry global error reporting failed:', sentryError);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      import('@sentry/vue')
        .then((Sentry) => {
          Sentry.captureException(new Error(event.reason), {
            extra: {
              type: 'unhandledrejection',
            },
          });
        })
        .catch(() => {
          console.error('Failed to report unhandled rejection to Sentry:', event.reason);
        });
    } catch (sentryError) {
      console.error('Sentry unhandled rejection reporting failed:', sentryError);
    }
  });
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%);
  color: #e5e5e5;
  font-family: 'Inter', sans-serif;
}

.error-content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  border: 1px solid #dc2626;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
}

.error-message {
  font-size: 1.1rem;
  color: #a3a3a3;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-button {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.error-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.error-button:active {
  transform: translateY(0);
}
</style> 