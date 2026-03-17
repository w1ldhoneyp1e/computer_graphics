import {KopatychApp} from './app'
import {loadScene} from './sceneLoader'

const bootstrap = async (): Promise<void> => {
	const canvas = document.getElementById('app') as HTMLCanvasElement | null
	if (!canvas) {
		throw new Error('Canvas с id="app" не найден')
	}
	const gl = canvas.getContext('webgl', {alpha: false})
	if (!gl) {
		throw new Error('WebGL не поддерживается')
	}
	const scene = await loadScene('/scene.json')
	const app = new KopatychApp(canvas, gl, scene)
	app.start()
}

bootstrap()
