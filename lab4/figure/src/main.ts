import {getCanvas, getGl} from './canvas'
import {DodecahedronScene} from './DodecahedronScene'
import {FigureRenderer} from './FigureRenderer'
import {OrbitCamera} from './OrbitCamera'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const camera = new OrbitCamera(canvas)
	const scene = new DodecahedronScene()
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
