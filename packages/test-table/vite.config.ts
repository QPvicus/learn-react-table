import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'react-table': 'react-table/src/index.ts'
		}
	},
	plugins: [reactRefresh()]
})
