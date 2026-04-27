import {
	type FirstPersonCameraState,
	type MazeNavigator,
	type Vec3,
} from './types'

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

class FirstPersonCamera {
	readonly state: FirstPersonCameraState
	private dragging = false
	private pointerId: number | null = null
	private lastX = 0
	private lastY = 0
	private readonly canvas: HTMLCanvasElement
	private readonly maze: MazeNavigator
	private readonly pressedKeys = new Set<string>()
	private lastUpdateTime = performance.now()
	private static readonly COLLISION_RADIUS = 0.28

	constructor(canvas: HTMLCanvasElement, maze: MazeNavigator) {
		this.canvas = canvas
		this.maze = maze

		this.state = {
			position: maze.getSpawnPosition(),
			yaw: 0,
			pitch: 0,
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
		window.addEventListener('keydown', event => {
			this.pressedKeys.add(event.code)
		})
		window.addEventListener('keyup', event => {
			this.pressedKeys.delete(event.code)
		})
		window.addEventListener('blur', () => {
			this.pressedKeys.clear()
		})
	}

	getPosition(): Vec3 {
		return [...this.state.position]
	}

	getTarget(): Vec3 {
		const forward = this.getForwardVector()
		const {position} = this.state

		return [
			position[0] + forward[0],
			position[1] + forward[1],
			position[2] + forward[2],
		]
	}

	update(): void {
		const now = performance.now()
		const deltaTime = Math.min((now - this.lastUpdateTime) / 1000, 0.05)
		this.lastUpdateTime = now

		const moveSpeed = 3
		const turnSpeed = 1.8
		const moveStep = moveSpeed * deltaTime
		const turnStep = turnSpeed * deltaTime
		const forward = this.getForwardVectorXZ()
		const right: Vec3 = [forward[2], 0, -forward[0]]

		if (this.pressedKeys.has('ArrowLeft')) {
			this.state.yaw += turnStep
		}

		if (this.pressedKeys.has('ArrowRight')) {
			this.state.yaw -= turnStep
		}

		if (this.pressedKeys.has('ArrowUp')) {
			this.state.pitch = clamp(this.state.pitch + turnStep * 0.7, -1.2, 1.2)
		}

		if (this.pressedKeys.has('ArrowDown')) {
			this.state.pitch = clamp(this.state.pitch - turnStep * 0.7, -1.2, 1.2)
		}

		if (this.pressedKeys.has('KeyW')) {
			this.move(forward, moveStep)
		}

		if (this.pressedKeys.has('KeyS')) {
			this.move(forward, -moveStep)
		}

		if (this.pressedKeys.has('KeyA')) {
			this.move(right, moveStep)
		}

		if (this.pressedKeys.has('KeyD')) {
			this.move(right, -moveStep)
		}
	}

	private move(direction: Vec3, distance: number): void {
		const nextX: Vec3 = [
			this.state.position[0] + direction[0] * distance,
			this.state.position[1],
			this.state.position[2],
		]
		if (this.maze.isPositionWalkable(nextX, FirstPersonCamera.COLLISION_RADIUS)) {
			this.state.position = nextX
		}

		const nextZ: Vec3 = [
			this.state.position[0],
			this.state.position[1],
			this.state.position[2] + direction[2] * distance,
		]
		if (this.maze.isPositionWalkable(nextZ, FirstPersonCamera.COLLISION_RADIUS)) {
			this.state.position = nextZ
		}
	}

	private getForwardVector(): Vec3 {
		const cosPitch = Math.cos(this.state.pitch)

		return [
			Math.sin(this.state.yaw) * cosPitch,
			Math.sin(this.state.pitch),
			Math.cos(this.state.yaw) * cosPitch,
		]
	}

	private getForwardVectorXZ(): Vec3 {
		return [
			Math.sin(this.state.yaw),
			0,
			Math.cos(this.state.yaw),
		]
	}
}

export {
	FirstPersonCamera,
}
