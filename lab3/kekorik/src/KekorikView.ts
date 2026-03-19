import {createOrthoBounds, screenToWorld} from './math'
import {type Primitive} from './primitives/Primitive'
import {
	type Color,
	type SceneInstance,
	type Vec2,
	type ViewBounds,
} from './types'
import {type WebGlRenderer} from './WebGlRenderer'

class KekorikView {
	private readonly canvas: HTMLCanvasElement
	private readonly renderer: WebGlRenderer
	private viewBounds: ViewBounds

	constructor(canvas: HTMLCanvasElement, renderer: WebGlRenderer) {
		this.canvas = canvas
		this.renderer = renderer
		this.viewBounds = createOrthoBounds(1, 1)
	}

	getCanvas(): HTMLCanvasElement {
		const canvas = this.canvas

		return canvas
	}

	getViewBounds(): ViewBounds {
		const viewBounds = this.viewBounds

		return viewBounds
	}

	initialize(background: Color): void {
		this.renderer.setBackground(background)
		this.updateCanvasSize()
	}

	updateCanvasSize(): void {
		const ratio = Math.max(window.devicePixelRatio || 1, 1)
		const width = Math.max(Math.floor(this.canvas.clientWidth * ratio), 1)
		const height = Math.max(Math.floor(this.canvas.clientHeight * ratio), 1)
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width
			this.canvas.height = height
		}
		this.viewBounds = createOrthoBounds(width, height)
		this.renderer.setViewBounds(this.viewBounds)
		this.renderer.resize(width, height)
	}

	getPointerWorldPosition(event: PointerEvent): Vec2 {
		const rect = this.canvas.getBoundingClientRect()
		const px = (event.clientX - rect.left) * (this.canvas.width / rect.width)
		const py = (event.clientY - rect.top) * (this.canvas.height / rect.height)
		const world = screenToWorld(px, py, this.canvas, this.viewBounds)

		return world
	}

	render(primitives: Primitive[], instances: SceneInstance[]): void {
		this.renderer.clear()
		for (const instance of instances) {
			for (const primitive of primitives) {
				const overrideColor = instance.colorOverrides[primitive.id]
				const built = primitive.build(instance, overrideColor)
				this.renderer.drawTriangles(built.vertices, built.color)
			}
		}
	}

	setCursor(cursor: string): void {
		this.canvas.style.cursor = cursor
	}

	capturePointer(pointerId: number): void {
		this.canvas.setPointerCapture(pointerId)
	}
}

export {
	KekorikView,
}
