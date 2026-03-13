import {
	ASTEROID_ANGLES,
	ASTEROID_BIG_RADIUS,
	ASTEROID_MEDIUM_RADIUS,
	ASTEROID_SMALL_RADIUS,
	ASTEROID_SPEED_MAX,
} from '../Shared/constants'
import {
	type Asteroid,
	type AsteroidSize,
	type Point,
} from '../Shared/types'

let nextId = 0

function randomVertices(radius: number, numPoints: number): Point[] {
	const verts: Point[] = []

	for (let i = 0; i < numPoints; i++) {
		const angle = (i / numPoints) * Math.PI * 2 - Math.PI / 2
		const r = radius * (0.7 + Math.random() * 0.3)
		verts.push({
			x: Math.cos(angle) * r,
			y: Math.sin(angle) * r,
		})
	}

	return verts
}

function randomVelocity(): Point {
	const angle = Math.random() * Math.PI * 2
	const speed = Math.random() * ASTEROID_SPEED_MAX

	return {
		x: Math.cos(angle) * speed,
		y: Math.sin(angle) * speed,
	}
}

function radiusForSize(size: AsteroidSize): number {
	switch (size) {
		case 'big':
			return ASTEROID_BIG_RADIUS
		case 'medium':
			return ASTEROID_MEDIUM_RADIUS
		case 'small':
			return ASTEROID_SMALL_RADIUS
	}
}

function createAsteroid(position: Point, size: AsteroidSize): Asteroid {
	nextId += 1
	const radius = radiusForSize(size)

	return {
		id: nextId,
		position: {...position},
		velocity: randomVelocity(),
		angle: Math.random() * Math.PI * 2,
		angularVelocity: (Math.random() - 0.5) * 0.05,
		size,
		vertices: randomVertices(radius, ASTEROID_ANGLES),
	}
}

function spawnInitial(width: number, height: number, count: number): Asteroid[] {
	const list: Asteroid[] = []
	const margin = 80

	for (let i = 0; i < count; i++) {
		const side = Math.floor(Math.random() * 4)
		let x: number
		let y: number

		if (side === 0) {
			x = Math.random() * width
			y = -margin
		}
		else if (side === 1) {
			x = width + margin
			y = Math.random() * height
		}
		else if (side === 2) {
			x = Math.random() * width
			y = height + margin
		}
		else {
			x = -margin
			y = Math.random() * height
		}

		list.push(createAsteroid({
			x,
			y,
		}, 'big'))
	}

	return list
}

export {
	createAsteroid,
	radiusForSize,
	spawnInitial,
}
