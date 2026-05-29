import {getCanvas, getGl} from './canvas'
import {OrbitCamera} from './OrbitCamera'
import {SurfaceGridFactory} from './SurfaceGrid'
import {TransformationRenderer} from './TransformationRenderer'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const camera = new OrbitCamera(canvas)
	const grid = SurfaceGridFactory.create({
		uSegments: 128,
		vSegments: 48,
	})
	const renderer = new TransformationRenderer({
		canvas,
		gl,
		grid,
	})

	function render(): void {
		renderer.renderFrame(camera)
		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}

main()
