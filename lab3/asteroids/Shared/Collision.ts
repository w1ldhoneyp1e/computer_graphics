import {type Point, type Polygon} from './types'

function cross2(a: Point, b: Point): number {
	return a.x * b.y - a.y * b.x
}

function pointInTriangle(p: Point, a: Point, b: Point, c: Point): boolean {
	const ab = {
		x: b.x - a.x,
		y: b.y - a.y,
	}
	const bc = {
		x: c.x - b.x,
		y: c.y - b.y,
	}
	const ca = {
		x: a.x - c.x,
		y: a.y - c.y,
	}
	const ap = {
		x: p.x - a.x,
		y: p.y - a.y,
	}
	const bp = {
		x: p.x - b.x,
		y: p.y - b.y,
	}
	const cp = {
		x: p.x - c.x,
		y: p.y - c.y,
	}

	const s1 = cross2(ab, ap)
	const s2 = cross2(bc, bp)
	const s3 = cross2(ca, cp)

	return (s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0)
}

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

function pointInPolygon(point: Point, worldVerts: Point[]): boolean {
	const n = worldVerts.length
	if (n < 3) {
		return false
	}

	for (let i = 1; i < n - 1; i++) {
		const v0 = worldVerts[0]
		const vi = worldVerts[i]
		const vi1 = worldVerts[i + 1]
		if (v0 && vi && vi1 && pointInTriangle(point, v0, vi, vi1)) {
			return true
		}
	}

	return false
}

function polygonOverlapsPolygon(a: Polygon, b: Polygon): boolean {
	const aWorld = worldVertices(a)
	const bWorld = worldVertices(b)

	for (const p of aWorld) {
		if (pointInPolygon(p, bWorld)) {
			return true
		}
	}

	for (const p of bWorld) {
		if (pointInPolygon(p, aWorld)) {
			return true
		}
	}

	return false
}

export {
	pointInPolygon,
	pointInTriangle,
	polygonOverlapsPolygon,
	worldVertices,
}
