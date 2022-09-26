import { defineConfig } from 'vite';

export default defineConfig({
	root: '.',
	base: '/2022-fall-data-visualization/w2-dynamic-bar-chart/dist/',
	build: {
		emptyOutDir: true,
		outDir: 'dist',
		assetsDir: '.'
	}
});
