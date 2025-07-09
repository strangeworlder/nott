import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
// Development-specific Vite configuration
import { defineConfig } from 'vite';

export default defineConfig({
  mode: 'development',

  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/config': resolve(__dirname, 'src/config'),
      '@/tests': resolve(__dirname, 'src/tests'),
    },
  },

  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4013',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: 'http://localhost:4013',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    hmr: {
      overlay: true,
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          three: ['three', 'cannon-es'],
          ui: ['@headlessui/vue', '@heroicons/vue'],
          audio: ['howler'],
          animation: ['gsap'],
          utils: ['lodash-es', 'date-fns', 'uuid'],
          network: ['socket.io-client', 'simple-peer'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'three',
      'cannon-es',
      '@headlessui/vue',
      '@heroicons/vue',
      'howler',
      'gsap',
      'lodash-es',
      'date-fns',
      'uuid',
      'socket.io-client',
      'simple-peer',
    ],
    exclude: ['@biomejs/biome'],
  },

  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: true,
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  esbuild: {
    keepNames: true,
  },
});
