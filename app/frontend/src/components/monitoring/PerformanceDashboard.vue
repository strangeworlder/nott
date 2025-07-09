<template>
  <div class="performance-dashboard">
    <div class="dashboard-header">
      <h2 class="text-xl font-bold text-gray-900">Performance Dashboard</h2>
      <div class="flex space-x-2">
        <button
          @click="refreshMetrics"
          :disabled="isLoading"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
        <button
          @click="toggleAutoRefresh"
          :class="[
            'px-3 py-1 text-sm rounded',
            autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
          ]"
        >
          {{ autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF' }}
        </button>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Core Web Vitals -->
      <div class="metric-card">
        <h3 class="text-lg font-semibold mb-4">Core Web Vitals</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>First Contentful Paint:</span>
            <span :class="getFcpClass()">{{ formatTime(metrics.fcp) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Largest Contentful Paint:</span>
            <span :class="getLcpClass()">{{ formatTime(metrics.lcp) }}</span>
          </div>
          <div class="flex justify-between">
            <span>First Input Delay:</span>
            <span :class="getFidClass()">{{ formatTime(metrics.fid) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Cumulative Layout Shift:</span>
            <span :class="getClsClass()">{{ formatCls(metrics.cls) }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metric-card">
        <h3 class="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Frame Rate:</span>
            <span>{{ metrics.frameRate || 'N/A' }} FPS</span>
          </div>
          <div class="flex justify-between">
            <span>Memory Usage:</span>
            <span>{{ formatMemory(metrics.memoryUsage) }}</span>
          </div>
          <div class="flex justify-between">
            <span>API Response Time:</span>
            <span>{{ getAverageApiTime() }}ms</span>
          </div>
        </div>
      </div>

      <!-- Component Performance -->
      <div class="metric-card">
        <h3 class="text-lg font-semibold mb-4">Component Performance</h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(time, component) in metrics.componentRenderTime"
            :key="component"
            class="flex justify-between text-sm"
          >
            <span class="truncate">{{ component }}:</span>
            <span>{{ time.toFixed(2) }}ms</span>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div class="metric-card">
        <h3 class="text-lg font-semibold mb-4">Errors ({{ metrics.errors?.length || 0 }})</h3>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(error, index) in metrics.errors?.slice(-5)"
            :key="index"
            class="text-sm text-red-600"
          >
            <div class="font-medium">{{ error.message }}</div>
            <div class="text-xs text-gray-500">{{ formatTimestamp(error.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Chart -->
    <div class="metric-card mt-6">
      <h3 class="text-lg font-semibold mb-4">Performance Timeline</h3>
      <div class="h-64 bg-gray-50 rounded p-4">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { environment } from '@/config/environment';
import { type PerformanceMetrics, performanceMonitor } from '@/services/monitoring/performance';
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Props
interface Props {
  autoRefreshInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoRefreshInterval: 5000,
});

// Reactive data
const isLoading = ref(false);
const autoRefresh = ref(false);
const metrics = ref<PerformanceMetrics>({} as PerformanceMetrics);
const _chartCanvas = ref<HTMLCanvasElement>();

// Auto-refresh timer
let refreshTimer: number | null = null;

// Computed
const isMonitoringEnabled = computed(() => environment.ENABLE_PERFORMANCE_MONITORING);

// Methods
const refreshMetrics = async () => {
  if (!isMonitoringEnabled.value) {
    return;
  }

  isLoading.value = true;
  try {
    metrics.value = performanceMonitor.getMetrics();
  } catch (error) {
    console.error('Failed to refresh metrics:', error);
  } finally {
    isLoading.value = false;
  }
};

const _toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value) {
    refreshTimer = window.setInterval(refreshMetrics, props.autoRefreshInterval);
  } else if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const _formatTime = (time?: number): string => {
  if (!time) {
    return 'N/A';
  }
  return `${time.toFixed(2)}ms`;
};

const _formatCls = (cls?: number): string => {
  if (!cls) {
    return 'N/A';
  }
  return cls.toFixed(3);
};

const _formatMemory = (memory?: number): string => {
  if (!memory) {
    return 'N/A';
  }
  return `${memory.toFixed(2)}MB`;
};

const _formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const _getAverageApiTime = (): string => {
  const times = Object.values(metrics.value.apiResponseTime || {});
  if (times.length === 0) {
    return 'N/A';
  }

  const average = times.reduce((a: number, b: number) => a + b, 0) / times.length;
  return average.toFixed(2);
};

// Performance class helpers
const _getFcpClass = () => {
  const fcp = metrics.value.fcp;
  if (!fcp) {
    return '';
  }
  return fcp < 1800 ? 'text-green-600' : fcp < 3000 ? 'text-yellow-600' : 'text-red-600';
};

const _getLcpClass = () => {
  const lcp = metrics.value.lcp;
  if (!lcp) {
    return '';
  }
  return lcp < 2500 ? 'text-green-600' : lcp < 4000 ? 'text-yellow-600' : 'text-red-600';
};

const _getFidClass = () => {
  const fid = metrics.value.fid;
  if (!fid) {
    return '';
  }
  return fid < 100 ? 'text-green-600' : fid < 300 ? 'text-yellow-600' : 'text-red-600';
};

const _getClsClass = () => {
  const cls = metrics.value.cls;
  if (!cls) {
    return '';
  }
  return cls < 0.1 ? 'text-green-600' : cls < 0.25 ? 'text-yellow-600' : 'text-red-600';
};

// Lifecycle
onMounted(() => {
  if (isMonitoringEnabled.value) {
    refreshMetrics();
  }
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
.performance-dashboard {
  @apply p-6 bg-white rounded-lg shadow-lg;
}

.dashboard-header {
  @apply flex justify-between items-center mb-6;
}

.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.metric-card {
  @apply p-4 bg-gray-50 rounded-lg border border-gray-200;
}
</style> 