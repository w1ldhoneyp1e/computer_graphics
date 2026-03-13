import {GameController} from './Controller/GameController'
import {InputManager} from './Controller/InputManager'
import {SoundManager} from './Controller/SoundManager'
import {GameModel} from './Model/GameModel'
import {GameRenderer} from './View/GameRenderer'

const canvas = document.getElementById('canvas') as HTMLCanvasElement | null
if (!canvas) {
	throw new Error('Canvas not found')
}

const gl = canvas.getContext('webgl', {alpha: false})
if (!gl) {
	throw new Error('WebGL not supported')
}

const width = 800
const height = 600
canvas.width = width
canvas.height = height

gl.viewport(0, 0, width, height)
gl.clearColor(0.02, 0.02, 0.06, 1)
gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

const model = new GameModel(width, height)
const view = new GameRenderer(gl, width, height)
const sound = new SoundManager()
const input = new InputManager()

const controller = new GameController({
	model,
	view,
	sound,
	input,
	gl,
})
controller.start()
