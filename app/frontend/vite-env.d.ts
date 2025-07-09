/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module 'vue' {
  export * from '@vue/runtime-dom';
}

declare global {
  interface Window {
    PerformanceObserver: typeof PerformanceObserver;
  }
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  interface LayoutShift extends PerformanceEntry {
    value: number;
    sources?: Array<{
      node?: Node;
      currentRect?: DOMRectReadOnly;
      previousRect?: DOMRectReadOnly;
    }>;
  }
}

export {};
