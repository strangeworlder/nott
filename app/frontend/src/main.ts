import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import { environment } from '@/config/environment';

// Initialize performance monitoring
if (environment.ENABLE_PERFORMANCE_MONITORING) {
  console.info('🔧 Performance monitoring initialized');
}

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
