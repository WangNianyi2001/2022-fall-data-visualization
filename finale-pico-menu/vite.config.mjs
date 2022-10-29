import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	base: 'https://wangnianyi2001.github.io/2022-fall-data-visualization/finale-pico-menu/dist/',
	build: {
		emptyOutDir: true,
		outDir: '../dist'
	}
});
