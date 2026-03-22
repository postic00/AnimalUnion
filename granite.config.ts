import { defineConfig } from '@apps-in-toss/web-framework/config'

export default defineConfig({
  appName: 'animalunion',
  brand: {
    displayName: '동물노동조합',
    primaryColor: '#FF8C00',
    icon: 'https://animal-union.vercel.app/icons/icon-512-rect.png',

  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
})
