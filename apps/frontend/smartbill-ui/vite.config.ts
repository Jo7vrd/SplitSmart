import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'SmartBill',
        short_name: 'SmartBill',
        description: 'Aplikasi AI Split Bill',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  preview: {
    allowedHosts: [
      'mounted-pulling-scenic-specials.trycloudflare.com'
    ]
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'pope-objectives-strips-hiking.trycloudflare.com',
      '192.168.1.108',
      'smartbill.shahwul.men'
    ]
  }
})