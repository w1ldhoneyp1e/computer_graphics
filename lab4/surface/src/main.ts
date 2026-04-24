import {getCanvas, getGl} from './canvas'
import {FigureRenderer} from './FigureRenderer'
import {MobiusStripScene} from './MobiusStripScene'
import {OrbitCamera} from './OrbitCamera'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const camera = new OrbitCamera(canvas)
	const scene = new MobiusStripScene()
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
