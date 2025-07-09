import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
// import { VitePWA } from "vite-plugin-pwa";
// import { visualizer } from "rollup-plugin-visualizer";
// import { compression } from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			vue(),
			// PWA support for offline functionality (commented until dependencies are properly installed)
			// VitePWA({
			// 	registerType: "autoUpdate",
			// 	workbox: {
			// 		globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
			// 		runtimeCaching: [
			// 			{
			// 				urlPattern: /^https:\/\/api\.nott\.game\/.*/i,
			// 				handler: "NetworkFirst",
			// 				options: {
			// 					cacheName: "api-cache",
			// 					expiration: {
			// 						maxEntries: 100,
			// 						maxAgeSeconds: 60 * 60 * 24, // 24 hours
			// 					},
			// 				},
			// 			},
			// 			{
			// 				urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
			// 				handler: "CacheFirst",
			// 				options: {
			// 					cacheName: "images-cache",
			// 					expiration: {
			// 						maxEntries: 1000,
			// 						maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
			// 					},
			// 				},
			// 			},
			// 		],
			// 	},
			// 	manifest: {
			// 		name: "NotT - Horror Tabletop Game",
			// 		short_name: "NotT",
			// 		description: "A horror-themed tabletop game experience",
			// 		theme_color: "#dc2626",
			// 		background_color: "#020617",
			// 		display: "standalone",
			// 		orientation: "landscape",
			// 		scope: "/",
			// 		start_url: "/",
			// 		icons: [
			// 			{
			// 				src: "/icons/icon-72x72.png",
			// 				sizes: "72x72",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-96x96.png",
			// 				sizes: "96x96",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-128x128.png",
			// 				sizes: "128x128",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-144x144.png",
			// 				sizes: "144x144",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-152x152.png",
			// 				sizes: "152x152",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-192x192.png",
			// 				sizes: "192x192",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-384x384.png",
			// 				sizes: "384x384",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "/icons/icon-512x512.png",
			// 				sizes: "512x512",
			// 				type: "image/png",
			// 			},
			// 		],
			// 	},
			// }),
			// Bundle compression for better performance
			// compression({
			// 	algorithm: "gzip",
			// 	ext: ".gz",
			// }),
			// compression({
			// 	algorithm: "brotliCompress",
			// 	ext: ".br",
			// }),
		],
		resolve: {
			alias: {
				"@": resolve(__dirname, "src"),
				"@/types": resolve(__dirname, "src/types"),
				"@/components": resolve(__dirname, "src/components"),
				"@/services": resolve(__dirname, "src/services"),
				"@/stores": resolve(__dirname, "src/stores"),
				"@/utils": resolve(__dirname, "src/utils"),
				"@/assets": resolve(__dirname, "src/assets"),
				"@/config": resolve(__dirname, "src/config"),
				"@/tests": resolve(__dirname, "src/tests"),
			},
		},
		server: {
			port: 3000,
			host: true,
			open: true,
			cors: true,
			proxy: {
				"/api": {
					target: "http://localhost:4013",
					changeOrigin: true,
					secure: false,
					ws: true,
				},
				"/socket.io": {
					target: "http://localhost:4013",
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
			outDir: "dist",
			sourcemap: mode === "development",
			minify: mode === "production" ? "terser" : false,
			target: "es2020",
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["vue", "vue-router", "pinia"],
						three: ["three", "cannon-es"],
						ui: ["@headlessui/vue", "@heroicons/vue"],
						audio: ["howler"],
						animation: ["gsap"],
						utils: ["lodash-es", "date-fns", "uuid"],
						network: ["socket.io-client", "simple-peer"],
					},
					// Optimize chunk naming for better caching
					chunkFileNames: (chunkInfo) => {
						const facadeModuleId = chunkInfo.facadeModuleId
							? chunkInfo.facadeModuleId.split("/").pop()
							: "chunk";
						return `js/${facadeModuleId}-[hash].js`;
					},
					entryFileNames: "js/[name]-[hash].js",
					assetFileNames: (assetInfo) => {
						const name = assetInfo.name;
						if (!name) return "assets/[name]-[hash].[ext]";

						const info = name.split(".");
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
				// Bundle analysis in production (commented until dependencies are properly installed)
				// ...(mode === "analyze" && {
				// 	plugins: [
				// 		visualizer({
				// 			filename: "dist/stats.html",
				// 			open: true,
				// 			gzipSize: true,
				// 			brotliSize: true,
				// 		}),
				// 	],
				// }),
			},
			// Optimize build performance
			chunkSizeWarningLimit: 1000,
			reportCompressedSize: true,
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/tests/setup.ts"],
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html", "lcov"],
				exclude: [
					"node_modules/",
					"src/tests/",
					"**/*.d.ts",
					"**/*.config.*",
					"**/coverage/**",
					"dist/**",
					"public/**",
				],
				thresholds: {
					global: {
						branches: 70,
						functions: 70,
						lines: 70,
						statements: 70,
					},
				},
			},
		},
		optimizeDeps: {
			include: [
				"vue",
				"vue-router",
				"pinia",
				"three",
				"cannon-es",
				"@headlessui/vue",
				"@heroicons/vue",
				"howler",
				"gsap",
				"lodash-es",
				"date-fns",
				"uuid",
				"socket.io-client",
				"simple-peer",
			],
			exclude: ["@biomejs/biome"],
		},
		define: {
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: mode === "development",
			__APP_VERSION__: JSON.stringify(process.env.npm_package_version),
			__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		},
		// Environment-specific configurations
		...(mode === "development" && {
			esbuild: {
				keepNames: true,
			},
		}),
		...(mode === "production" && {
			esbuild: {
				drop: ["console", "debugger"],
			},
		}),
	};
});
