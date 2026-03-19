import {KekorikController} from './KekorikController'
import {KekorikModel} from './KekorikModel'
import {KekorikView} from './KekorikView'
import {createOrthoBounds} from './math'
import {loadScene} from './sceneLoader'
import {WebGlRenderer} from './WebGlRenderer'

const run = async (): Promise<void> => {
	const canvas = document.getElementById('app') as HTMLCanvasElement | null
	if (!canvas) {
		throw new Error('Canvas с id="app" не найден')
	}
	const gl = canvas.getContext('webgl', {alpha: false})
	if (!gl) {
		throw new Error('WebGL не поддерживается')
	}
	const scene = await loadScene('/scene.json')

	const initialBounds = createOrthoBounds(1, 1)
	const renderer = new WebGlRenderer(gl, initialBounds)
	const model = new KekorikModel(scene)
	const view = new KekorikView(canvas, renderer)

	const app = new KekorikController(model, view)
	app.start()
}

run()
