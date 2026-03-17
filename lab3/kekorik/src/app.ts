import {createOrthoBounds, distanceSquared, screenToWorld} from './math'
import {buildPrimitiveSet} from './primitives'
import {WebGlRenderer} from './renderer'
import type {DragState, SceneData, SceneInstance, Vec2, ViewBounds} from './types'

const HIT_RADIUS = 230

class KopatychApp {
	private readonly canvas: HTMLCanvasElement
	private readonly renderer: WebGlRenderer
	private readonly scene: SceneData
	private readonly primitives
	private readonly instances: SceneInstance[]
	private viewBounds: ViewBounds
	private dragState: DragState | null = null

	constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext, scene: SceneData) {
		this.canvas = canvas
		this.scene = scene
		this.primitives = buildPrimitiveSet(scene.template)
		this.instances = scene.instances.map((instance) => ({
			position: [instance.position[0], instance.position[1]],
			scale: instance.scale,
			colorOverrides: {...instance.colorOverrides},
		}))
		this.viewBounds = createOrthoBounds(1, 1)
		this.renderer = new WebGlRenderer(gl, this.viewBounds)
		this.attachEvents()
		this.updateCanvasSize()
		this.renderer.setBackground(this.scene.background)
	}

	start(): void {
		const frame = () => {
			this.render()
			requestAnimationFrame(frame)
		}
		requestAnimationFrame(frame)
	}

	private attachEvents(): void {
		window.addEventListener('resize', this.handleResize)
		this.canvas.addEventListener('pointerdown', this.handlePointerDown)
		window.addEventListener('pointermove', this.handlePointerMove)
		window.addEventListener('pointerup', this.handlePointerUp)
		window.addEventListener('pointercancel', this.handlePointerUp)
	}

	private render(): void {
		this.renderer.clear()
		for (const instance of this.instances) {
			for (const primitive of this.primitives) {
				const overrideColor = instance.colorOverrides[primitive.id]
				const built = primitive.build(instance, overrideColor)
				this.renderer.drawTriangles(built.vertices, built.color)
			}
		}
	}

	private updateCanvasSize(): void {
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

	private pickInstance(point: Vec2): number | null {
		for (let i = this.instances.length - 1; i >= 0; i -= 1) {
			const instance = this.instances[i]
			if (!instance) {
				continue
			}
			const radius = HIT_RADIUS * instance.scale
			const hit = distanceSquared(point, instance.position) <= radius * radius
			if (hit) {
				return i
			}
		}

		return null
	}

	private getPointerWorldPosition(event: PointerEvent): Vec2 {
		const rect = this.canvas.getBoundingClientRect()
		const px = (event.clientX - rect.left) * (this.canvas.width / rect.width)
		const py = (event.clientY - rect.top) * (this.canvas.height / rect.height)
		const world = screenToWorld(px, py, this.canvas, this.viewBounds)

		return world
	}

	private readonly handleResize = (): void => {
		this.updateCanvasSize()
	}

	private readonly handlePointerDown = (event: PointerEvent): void => {
		const point = this.getPointerWorldPosition(event)
		const index = this.pickInstance(point)
		if (index === null) {
			return
		}
		const selected = this.instances[index]
		if (!selected) {
			return
		}
		this.dragState = {
			instanceIndex: index,
			offset: [selected.position[0] - point[0], selected.position[1] - point[1]],
		}
		this.canvas.setPointerCapture(event.pointerId)
		this.canvas.style.cursor = 'grabbing'
	}

	private readonly handlePointerMove = (event: PointerEvent): void => {
		const point = this.getPointerWorldPosition(event)
		if (this.dragState) {
			const current = this.instances[this.dragState.instanceIndex]
			if (!current) {
				return
			}
			current.position = [point[0] + this.dragState.offset[0], point[1] + this.dragState.offset[1]]
			return
		}
		const hovered = this.pickInstance(point)
		if (hovered !== null) {
			this.canvas.style.cursor = 'grab'
			return
		}
		this.canvas.style.cursor = 'default'
	}

	private readonly handlePointerUp = (): void => {
		this.dragState = null
		this.canvas.style.cursor = 'default'
	}
}

export {KopatychApp}
