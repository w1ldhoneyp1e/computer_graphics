import {getCanvas, getGl} from './canvas'
import {FigureRenderer} from './FigureRenderer'
import {FirstPersonCamera} from './FirstPersonCamera'
import {OctahedronScene} from './OctahedronScene'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const camera = new FirstPersonCamera(canvas)
	const scene = new OctahedronScene()
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
