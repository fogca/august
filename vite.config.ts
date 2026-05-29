import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	// 3000 is used by the Dev/takumiisobe dev server, so August defaults to 3100.
	// host: true exposes the dev server on the LAN (test on phone via the IP).
	server: {
		port: 3100,
		host: true
	},
	preview: {
		port: 3100
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
