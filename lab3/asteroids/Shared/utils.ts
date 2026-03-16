import {type Point, type Polygon} from './types'

function worldVertices(polygon: Polygon): Point[] {
	const {
		position,
		vertices,
		angle,
	} = polygon

	const cos = Math.cos(angle)
	const sin = Math.sin(angle)

	return vertices.map(v => ({
		x: position.x + v.x * cos - v.y * sin,
		y: position.y + v.x * sin + v.y * cos,
	}))
}

export {
	worldVertices,
}

