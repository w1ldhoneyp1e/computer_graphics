import {type KekorikModel} from './KekorikModel'
import {type KekorikView} from './KekorikView'

class KekorikController {
	private readonly model: KekorikModel
	private readonly view: KekorikView

	constructor(model: KekorikModel, view: KekorikView) {
		this.model = model
		this.view = view
	}

	start(): void {
		this.view.initialize(this.model.getBackground())
		this.bindListeners()
		this.loop()
	}

	private bindListeners(): void {
		const canvas = this.view.getCanvas()
		window.addEventListener('resize', this.handleResize)
		canvas.addEventListener('pointerdown', this.handlePointerDown)
		window.addEventListener('pointermove', this.handlePointerMove)
		window.addEventListener('pointerup', this.handlePointerUp)
		window.addEventListener('pointercancel', this.handlePointerUp)
	}

	private loop = (): void => {
		this.view.render(this.model.getPrimitives(), this.model.getInstances())
		requestAnimationFrame(this.loop)
	}

	private readonly handleResize = (): void => {
		this.view.updateCanvasSize()
	}

	private readonly handlePointerDown = (event: PointerEvent): void => {
		const point = this.view.getPointerWorldPosition(event)
		const index = this.model.pickInstance(point)
		if (index === null) {
			return
		}
		const dragStarted = this.model.beginDrag(index, point)
		if (!dragStarted) {
			return
		}
		this.view.capturePointer(event.pointerId)
		this.view.setCursor('grabbing')
	}

	private readonly handlePointerMove = (event: PointerEvent): void => {
		const point = this.view.getPointerWorldPosition(event)
		if (this.model.isDragging()) {
			this.model.updateDrag(point)
			this.view.setCursor('grabbing')

			return
		}
		const hovered = this.model.pickInstance(point)
		if (hovered !== null) {
			this.view.setCursor('grab')

			return
		}
		this.view.setCursor('default')
	}

	private readonly handlePointerUp = (): void => {
		this.model.endDrag()
		this.view.setCursor('default')
	}
}

export {
	KekorikController,
}
