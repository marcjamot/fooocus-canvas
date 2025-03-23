import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [sveltekit()],
		server: {
			proxy: {
				"/fooocus": {
					target: env.FOOOCUS_HOST,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/fooocus/, ""),
					ws: true,
				},
			},
		},
	};
});
