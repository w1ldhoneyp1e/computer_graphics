import {type OrbitCameraState, type Vec3} from './types'

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

class OrbitCamera {
	readonly state: OrbitCameraState
	private dragging = false
	private pointerId: number | null = null
	private lastX = 0
	private lastY = 0
	private readonly canvas: HTMLCanvasElement

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		this.state = {
			yaw: 0.7,
			pitch: 0.45,
			distance: 6,
		}

		canvas.addEventListener('pointerdown', event => {
			this.dragging = true
			this.pointerId = event.pointerId
			this.lastX = event.clientX
			this.lastY = event.clientY
			canvas.setPointerCapture(event.pointerId)
		})

		canvas.addEventListener('pointermove', event => {
			if (!this.dragging || event.pointerId !== this.pointerId) {
				return
			}

			const dx = event.clientX - this.lastX
			const dy = event.clientY - this.lastY
			this.lastX = event.clientX
			this.lastY = event.clientY
			this.state.yaw += dx * 0.008
			this.state.pitch = clamp(this.state.pitch - dy * 0.008, -1.45, 1.45)
		})

		const stopDragging = (event: PointerEvent): void => {
			if (event.pointerId !== this.pointerId) {
				return
			}

			this.dragging = false
			this.pointerId = null

			this.canvas.releasePointerCapture(event.pointerId)
		}

		canvas.addEventListener('pointerup', stopDragging)
		canvas.addEventListener('pointercancel', stopDragging)
		canvas.addEventListener('wheel', event => {
			event.preventDefault()
			this.state.distance = clamp(this.state.distance + event.deltaY * 0.01, 3.2, 13)
		}, {passive: false})
	}

	getPosition(): Vec3 {
		const x = this.state.distance * Math.cos(this.state.pitch) * Math.sin(this.state.yaw)
		const y = this.state.distance * Math.sin(this.state.pitch)
		const z = this.state.distance * Math.cos(this.state.pitch) * Math.cos(this.state.yaw)

		return [x, y, z]
	}
}

export {
	OrbitCamera,
}
