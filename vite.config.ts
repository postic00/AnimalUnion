import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
	resolve: {
		alias: mode === 'development' ? {
			'@apps-in-toss/web-framework': path.resolve(__dirname, 'src/stubs/apps-in-toss-web-framework.ts'),
		} : undefined,
	},
	build: {
		chunkSizeWarningLimit: 600,
	},
}))
