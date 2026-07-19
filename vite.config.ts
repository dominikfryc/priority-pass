import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: [
          `${basePath === '/' ? '' : basePath.replace(/\/$/, '')}/share-target-sw.js`,
        ],
        navigateFallback: `${basePath === '/' ? '' : basePath.replace(/\/$/, '')}/index.html`,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.kiwi\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'airline-logos-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Priority Pass',
        short_name: 'Priority Pass',
        description: 'Manage your boarding passes',
        theme_color: '#141414',
        background_color: '#141414',
        display: 'standalone',
        orientation: 'portrait',
        share_target: {
          action: `${basePath === '/' ? '' : basePath.replace(/\/$/, '')}/share-target`,
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            files: [
              {
                name: 'image',
                accept: ['image/jpeg', 'image/png', 'image/webp'],
              },
            ],
          },
        },
        icons: [
          {
            src: `${basePath === '/' ? '' : basePath.replace(/\/$/, '')}/icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: `${basePath === '/' ? '' : basePath.replace(/\/$/, '')}/icon.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
