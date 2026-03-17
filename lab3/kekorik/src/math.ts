import type {Vec2, ViewBounds} from './types'

const TAU = Math.PI * 2

const createOrthoBounds = (width: number, height: number): ViewBounds => {
	const safeWidth = Math.max(width, 1)
	const safeHeight = Math.max(height, 1)
	const halfHeight = safeHeight * 0.5
	const halfWidth = halfHeight * (safeWidth / safeHeight)

	return {
		left: -halfWidth,
		right: halfWidth,
		bottom: -halfHeight,
		top: halfHeight,
	}
}

const worldToNdc = (x: number, y: number, view: ViewBounds): Vec2 => {
	const nx = ((x - view.left) / (view.right - view.left)) * 2 - 1
	const ny = ((y - view.bottom) / (view.top - view.bottom)) * 2 - 1

	return [nx, ny]
}

const screenToWorld = (px: number, py: number, canvas: HTMLCanvasElement, view: ViewBounds): Vec2 => {
	const x01 = px / canvas.width
	const y01 = 1 - py / canvas.height
	const wx = view.left + (view.right - view.left) * x01
	const wy = view.bottom + (view.top - view.bottom) * y01

	return [wx, wy]
}

const transformPoint = (point: Vec2, position: Vec2, scale: number): Vec2 => {
	const x = point[0] * scale + position[0]
	const y = point[1] * scale + position[1]

	return [x, y]
}

const distanceSquared = (a: Vec2, b: Vec2): number => {
	const dx = a[0] - b[0]
	const dy = a[1] - b[1]

	return dx * dx + dy * dy
}

export {
	TAU,
	createOrthoBounds,
	distanceSquared,
	screenToWorld,
	transformPoint,
	worldToNdc,
}
