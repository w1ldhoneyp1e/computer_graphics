import {type RgbaColor, colord} from 'colord'
import {type Point, type TriangleProps} from './types'

function parseColor(color: string): RgbaColor {
	const c = colord(color)
	if (!c.isValid()) {
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 1,
		}
	}

	return c.toRgb()
}

type SignedDistanceFromEdgeParams = {
	start: Point,
	end: Point,
	point: Point,
}

function distanceFromEdge({
	start,
	end,
	point,
}: SignedDistanceFromEdgeParams): number {
	const edgeDx = end.x - start.x
	const edgeDy = end.y - start.y
	const pointFromStartX = point.x - start.x
	const pointFromStartY = point.y - start.y

	return pointFromStartX * edgeDy - pointFromStartY * edgeDx
}

function onTheSameSide(
	reference: number,
	point: number,
): boolean {
	return (reference > 0 && point >= 0) || (reference < 0 && point <= 0)
}

function normalizeWinding(
	v0: Point,
	v1: Point,
	v2: Point,
): [Point, Point, Point] {
	const signedArea = -distanceFromEdge({
		start: v0,
		end: v1,
		point: v2,
	})

	return signedArea < 0
		? [v0, v2, v1]
		: [v0, v1, v2]
}

type BoundingBox = {
	xMin: number,
	xMax: number,
	yMin: number,
	yMax: number,
}

type GetBoundingBoxParams = {
	v0: Point,
	v1: Point,
	v2: Point,
	width: number,
	height: number,
}

function getBoundingBox({
	v0,
	v1,
	v2,
	width,
	height,
}: GetBoundingBoxParams): BoundingBox {
	return {
		xMin: Math.max(0, Math.floor(Math.min(v0.x, v1.x, v2.x))),
		xMax: Math.min(width, Math.ceil(Math.max(v0.x, v1.x, v2.x))),
		yMin: Math.max(0, Math.floor(Math.min(v0.y, v1.y, v2.y))),
		yMax: Math.min(height, Math.ceil(Math.max(v0.y, v1.y, v2.y))),
	}
}

function draw(
	ctx: CanvasRenderingContext2D,
	props: TriangleProps,
) {
	const [v0, v1, v2] = normalizeWinding(props.v0, props.v1, props.v2)
	const {
		width,
		height,
	} = ctx.canvas
	const {
		xMin,
		xMax,
		yMin,
		yMax,
	} = getBoundingBox({
		v0,
		v1,
		v2,
		width,
		height,
	})

	if (xMin >= xMax || yMin >= yMax) {
		return
	}

	const edge01_2 = distanceFromEdge({
		start: v0,
		end: v1,
		point: v2,
	})
	const edge02_1 = distanceFromEdge({
		start: v0,
		end: v2,
		point: v1,
	})
	const edge12_0 = distanceFromEdge({
		start: v1,
		end: v2,
		point: v0,
	})

	const rgbaColor = parseColor(props.fillColor)

	const imageData = ctx.getImageData(xMin, yMin, xMax - xMin, yMax - yMin)
	const data = imageData.data

	for (let iy = yMin; iy < yMax; iy++) {
		const py = iy + 0.5
		const rowOffset = (iy - yMin) * (xMax - xMin) * 4
		for (let ix = xMin; ix < xMax; ix++) {
			const pixelCenter = {
				x: ix + 0.5,
				y: py,
			}
			const edge01_pixel = distanceFromEdge({
				start: v0,
				end: v1,
				point: pixelCenter,
			})
			const edge02_pixel = distanceFromEdge({
				start: v0,
				end: v2,
				point: pixelCenter,
			})
			const edge12_pixel = distanceFromEdge({
				start: v1,
				end: v2,
				point: pixelCenter,
			})

			const inside01 = onTheSameSide(edge01_2, edge01_pixel)
			const inside02 = onTheSameSide(edge02_1, edge02_pixel)
			const inside12 = onTheSameSide(edge12_0, edge12_pixel)

			if (inside01 && inside02 && inside12) {
				const idx = rowOffset + (ix - xMin) * 4
				data.set([
					Math.round(rgbaColor.r),
					Math.round(rgbaColor.g),
					Math.round(rgbaColor.b),
					Math.round(rgbaColor.a * 255),
				], idx)
			}
		}
	}

	ctx.putImageData(imageData, xMin, yMin)
}

export {
	draw,
}
