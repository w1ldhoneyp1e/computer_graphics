import {type OrbitCameraController, type OrbitCameraState} from './types'

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

function createOrbitCameraController(canvas: HTMLCanvasElement): OrbitCameraController {
	const state: OrbitCameraState = {
		yaw: 0.7,
		pitch: 0.45,
		distance: 6,
	}
	let dragging = false
	let pointerId: number | null = null
	let lastX = 0
	let lastY = 0

	canvas.addEventListener('pointerdown', event => {
		dragging = true
		pointerId = event.pointerId
		lastX = event.clientX
		lastY = event.clientY
		canvas.setPointerCapture(event.pointerId)
	})
	canvas.addEventListener('pointermove', event => {
		if (!dragging || event.pointerId !== pointerId) {
			return
		}

		const dx = event.clientX - lastX
		const dy = event.clientY - lastY
		lastX = event.clientX
		lastY = event.clientY
		state.yaw += dx * 0.008
		state.pitch = clamp(state.pitch + dy * 0.008, -1.45, 1.45)
	})

	function stopDragging(event: PointerEvent): void {
		if (event.pointerId !== pointerId) {
			return
		}

		dragging = false
		pointerId = null
		canvas.releasePointerCapture(event.pointerId)
	}

	canvas.addEventListener('pointerup', stopDragging)
	canvas.addEventListener('pointercancel', stopDragging)
	canvas.addEventListener('wheel', event => {
		event.preventDefault()
		state.distance = clamp(state.distance + event.deltaY * 0.01, 3.2, 13)
	}, {passive: false})

	return {
		state,
	}
}

export {
	createOrbitCameraController,
}
