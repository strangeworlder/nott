import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
// Staging-specific Vite configuration
import { defineConfig } from 'vite';

export default defineConfig({
  mode: 'staging',

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

  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
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
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;
          if (!name) {
            return 'assets/[name]-[hash].[ext]';
          }

          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
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
