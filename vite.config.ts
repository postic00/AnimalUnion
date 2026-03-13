import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'apps-in-toss/web-framework': path.resolve(__dirname, 'src/stubs/apps-in-toss-web-framework.ts'),
		},
	},
})
