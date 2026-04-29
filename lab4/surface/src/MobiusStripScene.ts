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
			scale * radius * Math.cos(u),
			scale * radius * Math.sin(u),
			scale * (v / 2) * Math.sin(u / 2),
		]
	}

	private static createTriangleFace(indices: [number, number, number]): FigureFace {
		return {
			indices: new Uint16Array(indices),
		}
	}

	private static createSurfaceNormal(u: number, v: number, scale: number): Vec3 {
		const delta = 0.0005
		const uTangent = vec3Subtract(
			MobiusStripScene.createSurfacePoint(u + delta, v, scale),
			MobiusStripScene.createSurfacePoint(u - delta, v, scale),
		)
		const vTangent = vec3Subtract(
			MobiusStripScene.createSurfacePoint(u, v + delta, scale),
			MobiusStripScene.createSurfacePoint(u, v - delta, scale),
		)

		return vec3Normalize(vec3Cross(uTangent, vTangent))
	}

	private static createMobiusStripGeometry({
		scale,
		uSegments,
		vSegments,
		stripWidth,
	}: CreateMobiusStripSceneArgs): FigureGeometry {
		const points: Vec3[] = []
		const normals: Vec3[] = []
		const edgeSet = new Set<Edge>()
		const faces: FigureFace[] = []

		const index = (uIndex: number, vIndex: number): number => uIndex * (vSegments + 1) + vIndex

		for (let i = 0; i <= uSegments; i++) {
			const u = (2 * Math.PI * i) / uSegments

			for (let j = 0; j <= vSegments; j++) {
				const v = -(stripWidth / 2) + (stripWidth * j) / vSegments
				points.push(MobiusStripScene.createSurfacePoint(u, v, scale))
				normals.push(MobiusStripScene.createSurfaceNormal(u, v, scale))
			}
		}

		const yValues = points.map(([, y]) => y)
		const minY = Math.min(...yValues)
		const maxY = Math.max(...yValues)

		const addQuad = (args: {
			a: number,
			b: number,
			c: number,
			d: number,
		}): void => {
			const {a, b, c, d} = args
			edgeSet.add(MobiusStripScene.makeEdgeKey(a, b))
			edgeSet.add(MobiusStripScene.makeEdgeKey(b, d))
			edgeSet.add(MobiusStripScene.makeEdgeKey(d, c))
			edgeSet.add(MobiusStripScene.makeEdgeKey(c, a))

			faces.push(
				MobiusStripScene.createTriangleFace([a, c, b]),
				MobiusStripScene.createTriangleFace([b, c, d]),
			)
		}

		for (let i = 0; i < uSegments - 1; i++) {
			for (let j = 0; j < vSegments; j++) {
				const a = index(i, j)
				const b = index(i + 1, j)
				const c = index(i, j + 1)
				const d = index(i + 1, j + 1)

				addQuad({a, b, c, d})
			}
		}

		for (let j = 0; j < vSegments; j++) {
			const a = index(uSegments - 1, j)
			const b = index(uSegments, j)
			const c = index(uSegments - 1, j + 1)
			const d = index(uSegments, j + 1)
			addQuad({a, b, c, d})
		}

		const vertices = new Float32Array(
			points.flatMap(point => point),
		)
		const normalBuffer = new Float32Array(
			normals.flatMap(normal => normal),
		)

		const edgeIndicesArray: number[] = [...edgeSet].flatMap(
			edge => MobiusStripScene.getVerticesFromEdge(edge),
		)

		return {
			vertices,
			normals: normalBuffer,
			faces,
			edgeIndices: new Uint16Array(edgeIndicesArray),
			minY,
			maxY,
		}
	}
}

export {
	MobiusStripScene,
}
