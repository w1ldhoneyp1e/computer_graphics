/* eslint-disable @stylistic/object-curly-newline */
/* eslint-disable @stylistic/object-property-newline */
import {
	vec3Cross,
	vec3Normalize,
	vec3Subtract,
} from './math'
import {
	type Edge,
	type FigureFace,
	type FigureGeometry,
	type FigureScene,
	type Vec3,
	type Vec4,
} from './types'

type CreateMobiusStripSceneArgs = {
	scale: number,
	uSegments: number,
	vSegments: number,
	stripWidth: number,
}

type MobiusStripSceneConstructorType = Partial<CreateMobiusStripSceneArgs> & {
	lightDirection?: Vec3,
}

class MobiusStripScene implements FigureScene {
	readonly geometry: FigureGeometry
	readonly lightDirection: Vec3

	private static readonly FACE_PALETTE: Vec4[] = [
		[0.93, 0.25, 0.25, 0.44],
		[0.25, 0.82, 0.42, 0.44],
		[0.23, 0.55, 0.95, 0.44],
		[0.95, 0.75, 0.22, 0.44],
		[0.85, 0.36, 0.78, 0.44],
		[0.20, 0.78, 0.82, 0.44],
		[0.96, 0.52, 0.16, 0.44],
		[0.56, 0.42, 0.92, 0.44],
	]

	constructor({
		scale = 1.6,
		lightDirection = [-5, -5, -5],
		uSegments = 96,
		vSegments = 18,
		stripWidth = 0.6,
	}: MobiusStripSceneConstructorType = {}) {
		this.geometry = MobiusStripScene.createMobiusStripGeometry({
			scale,
			uSegments,
			vSegments,
			stripWidth,
		})
		this.lightDirection = lightDirection
	}

	private static getFaceColorByIndex(index: number): Vec4 {
		return MobiusStripScene.FACE_PALETTE[index % MobiusStripScene.FACE_PALETTE.length]!
	}

	private static makeEdgeKey(a: number, b: number): Edge {
		return a < b
			? `${a}-${b}`
			: `${b}-${a}`
	}

	private static getVerticesFromEdge(edge: Edge): [number, number] {
		const [a, b] = edge.split('-')
		return [Number(a), Number(b)]
	}

	private static createSurfacePoint(u: number, v: number, scale: number): Vec3 {
		const radius = 1 + (v / 2) * Math.cos(u / 2)

		return [
			scale * 0.8 * radius * Math.cos(u),
			scale * 1.5 * radius * Math.sin(u),
			scale * 0.8 * (v / 2) * Math.sin(u / 2),
		]
	}

	private static createTriangleFace(
		points: Vec3[],
		indices: [number, number, number],
		color: Vec4,
	): FigureFace {
		const a = points[indices[0]]
		const b = points[indices[1]]
		const c = points[indices[2]]
		const cross = vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))

		return {
			indices: new Uint16Array(indices),
			normal: vec3Normalize(cross),
			color,
		}
	}

	private static createMobiusStripGeometry({
		scale,
		uSegments,
		vSegments,
		stripWidth,
	}: CreateMobiusStripSceneArgs): FigureGeometry {
		const points: Vec3[] = []
		const edgeSet = new Set<Edge>()
		const faces: FigureFace[] = []

		const index = (uIndex: number, vIndex: number): number => uIndex * (vSegments + 1) + vIndex

		for (let i = 0; i < uSegments; i++) {
			const u = (2 * Math.PI * i) / uSegments

			for (let j = 0; j <= vSegments; j++) {
				const v = -(stripWidth / 2) + (stripWidth * j) / vSegments
				points.push(MobiusStripScene.createSurfacePoint(u, v, scale))
			}
		}

		const addQuad = (args: {
			a: number,
			b: number,
			c: number,
			d: number,
			quadIndex: number,
		}): void => {
			const {a, b, c, d, quadIndex} = args
			edgeSet.add(MobiusStripScene.makeEdgeKey(a, b))
			edgeSet.add(MobiusStripScene.makeEdgeKey(b, d))
			edgeSet.add(MobiusStripScene.makeEdgeKey(d, c))
			edgeSet.add(MobiusStripScene.makeEdgeKey(c, a))

			faces.push(
				MobiusStripScene.createTriangleFace(
					points,
					[a, c, b],
					MobiusStripScene.getFaceColorByIndex(quadIndex * 2),
				),
				MobiusStripScene.createTriangleFace(
					points,
					[b, c, d],
					MobiusStripScene.getFaceColorByIndex(quadIndex * 2 + 1),
				),
			)
		}

		let quadIndex = 0
		for (let i = 0; i < uSegments - 1; i++) {
			for (let j = 0; j < vSegments; j++) {
				const a = index(i, j)
				const b = index(i + 1, j)
				const c = index(i, j + 1)
				const d = index(i + 1, j + 1)

				addQuad({a, b, c, d, quadIndex})
				quadIndex += 1
			}
		}

		for (let j = 0; j < vSegments; j++) {
			const a = index(uSegments - 1, j)
			const c = index(uSegments - 1, j + 1)
			const b = index(0, vSegments - j)
			const d = index(0, vSegments - (j + 1))
			addQuad({a, b, c, d, quadIndex})
			quadIndex += 1
		}

		const vertices = new Float32Array(
			points.flatMap(point => point),
		)

		const edgeIndicesArray: number[] = [...edgeSet].flatMap(
			edge => MobiusStripScene.getVerticesFromEdge(edge),
		)

		return {
			vertices,
			faces,
			edgeIndices: new Uint16Array(edgeIndicesArray),
		}
	}
}

export {
	MobiusStripScene,
}
