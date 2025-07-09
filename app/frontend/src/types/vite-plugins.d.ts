// Type declarations for Vite plugins
declare module 'vite-plugin-pwa' {
  import type { Plugin } from 'vite';

  interface VitePWAPluginOptions {
    registerType?: 'autoUpdate' | 'prompt' | 'skipWaiting';
    workbox?: {
      globPatterns?: string[];
      runtimeCaching?: Array<{
        urlPattern: RegExp | string;
        handler: string;
        options?: {
          cacheName?: string;
          expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
          };
        };
      }>;
    };
    manifest?: {
      name?: string;
      short_name?: string;
      description?: string;
      theme_color?: string;
      background_color?: string;
      display?: string;
      orientation?: string;
      scope?: string;
      start_url?: string;
      icons?: Array<{
        src: string;
        sizes: string;
        type: string;
      }>;
    };
  }

  export function VitePWA(options?: VitePWAPluginOptions): Plugin;
}

declare module 'vite-plugin-compression' {
  import type { Plugin } from 'vite';

  interface CompressionOptions {
    algorithm: 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw';
    ext: string;
    threshold?: number;
    deleteOriginFile?: boolean;
    filter?: RegExp | ((file: string) => boolean);
  }

  function compression(options: CompressionOptions): Plugin;
  export default compression;
}

declare module 'rollup-plugin-visualizer' {
  import type { Plugin } from 'rollup';

  interface VisualizerOptions {
    filename?: string;
    open?: boolean;
    gzipSize?: boolean;
    brotliSize?: boolean;
    template?: string;
    title?: string;
    metadata?: Record<string, unknown>;
  }

  export function visualizer(options?: VisualizerOptions): Plugin;
}
