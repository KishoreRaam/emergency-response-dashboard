import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['apple-touch-icon.png'],
      workbox: {
        // Don't intercept API calls or external tile requests
        navigateFallbackDenylist: [/^\/api/, /^https?:\/\//],
        // Cache Overpass API responses for offline use
        runtimeCaching: [
          {
            urlPattern: /overpass-api\.de|overpass\.kumi\.systems|lz4\.overpass-api\.de/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'overpass-api',
              expiration: { maxEntries: 10, maxAgeSeconds: 7200 },
              networkTimeoutSeconds: 8,
            },
          },
          {
            // Cache map tiles for offline use
            urlPattern: /arcgisonline\.com|tile\.openstreetmap\.org/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
      manifest: {
        name: 'RoadSoS',
        short_name: 'RoadSoS',
        description: 'Emergency services locator for road accident victims.',
        theme_color: '#D62828',
        background_color: '#0D0D0D',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
