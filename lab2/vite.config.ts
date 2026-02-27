import {defineConfig} from 'vite'

export default defineConfig({
	root: '.',
	publicDir: 'public',
	build: {
		rollupOptions: {
			input: {
				main: 'index.html',
				potions: 'potions/index.html',
			},
		},
	},
})
