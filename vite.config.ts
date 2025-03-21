import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/fooocus': {
				target: 'http://192.168.1.114:7865/',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/fooocus/, ''),
				ws: true,
			}
		},
	},
});
