import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		vite: {
			build: {
				rollupOptions: {
					external: ['geoip-lite']
				}
			}
		}
	}
};

export default config;
