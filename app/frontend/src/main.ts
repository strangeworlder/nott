import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { environment } from '@/config/environment';
// --- Sentry Integration ---
import * as Sentry from '@sentry/vue';

// Initialize performance monitoring
if (environment.ENABLE_PERFORMANCE_MONITORING) {
  console.info('🔧 Performance monitoring initialized');
}

const app = createApp(App);

// --- Sentry setup ---
// Only initialize Sentry if DSN is provided and not empty
if (environment.SENTRY_DSN && environment.SENTRY_DSN.trim() !== '') {
  Sentry.init({
    app,
    dsn: environment.SENTRY_DSN,
    environment: environment.APP_ENV,
    release: environment.APP_VERSION,
    tracesSampleRate: environment.APP_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event: Sentry.ErrorEvent) {
      // Remove sensitive data
      if (event.request?.headers && typeof event.request.headers === 'object') {
        const headers = event.request.headers as Record<string, string | undefined>;
        headers.authorization = undefined;
        headers.cookie = undefined;
      }
      return event;
    },
    // Enable debug in development
    debug: environment.APP_ENV === 'development',
  });
  console.info('🔧 Sentry initialized with DSN');
} else {
  console.info('🔧 Sentry disabled - no DSN provided');
}

app.use(createPinia());
app.use(router);

// Mount the app
app.mount('#app');
