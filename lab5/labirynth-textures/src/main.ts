import {getCanvas, getGl} from './canvas'
import {FigureRenderer} from './FigureRenderer'
import {FirstPersonCamera} from './FirstPersonCamera'
import {MazeScene} from './MazeScene'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const scene = new MazeScene()
	const camera = new FirstPersonCamera(canvas, scene)
	const renderer = new FigureRenderer({
		canvas,
		gl,
		scene,
	})

	function render(): void {
		renderer.renderFrame(camera)
		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}

main()
