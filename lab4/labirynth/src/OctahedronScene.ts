import {
	vec3Cross,
	vec3Normalize,
	vec3Subtract,
} from './math'
import {
	type Edge,
	type FigureGeometry,
	type FigureScene,
	type Vec3,
	type Vec4,
} from './types'


type OctahedronSceneConstructorType = {
	scale?: number,
	lightDirection?: Vec3,
}

class OctahedronScene implements FigureScene {
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
	private static readonly FLOOR_COLOR: Vec4 = [0.24, 0.32, 0.78, 0.92]
	private static readonly CEILING_COLOR: Vec4 = [0.86, 0.82, 0.68, 0.92]

	constructor({
		scale = 1.6,
		lightDirection = [-5, -5, -5],
	}: OctahedronSceneConstructorType = {}) {
		this.geometry = OctahedronScene.createOctahedronGeometry(scale)
		this.lightDirection = lightDirection
	}

	private static createOctahedronVertices(): Vec3[] {
		return [
			[1, 0, 0],
			[-1, 0, 0],
			[0, 1, 0],
			[0, -1, 0],
			[0, 0, 1],
			[0, 0, -1],
		]
	}

	private static createOctahedronFaces(): number[][] {
		return [
			[0, 2, 4],
			[2, 1, 4],
			[1, 3, 4],
			[3, 0, 4],
			[2, 0, 5],
			[1, 2, 5],
			[3, 1, 5],
			[0, 3, 5],
		]
	}

	private static getFaceColorByIndex(index: number) {
		return OctahedronScene.FACE_PALETTE[index % OctahedronScene.FACE_PALETTE.length]!
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

	private static createOctahedronGeometry(scale = 1.6): FigureGeometry {
		const vertices: Vec3[] = []
		const faces: FigureGeometry['faces'] = []
		const edgeSet = new Set<Edge>()
		const octaVertices = OctahedronScene.createOctahedronVertices()
		const octaFaces = OctahedronScene.createOctahedronFaces()

		const addTriangle = (triangle: [number, number, number], color: Vec4): void => {
			const a = vertices[triangle[0]]!
			const b = vertices[triangle[1]]!
			const c = vertices[triangle[2]]!

			for (let i = 0; i < triangle.length; i++) {
				edgeSet.add(OctahedronScene.makeEdgeKey(
					triangle[i]!,
					triangle[(i + 1) % triangle.length]!,
				))
			}

			const cross = vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))

			faces.push({
				indices: new Uint16Array(triangle),
				normal: vec3Normalize(cross),
				color,
			})
		}

		const addQuad = (quadVertices: [Vec3, Vec3, Vec3, Vec3], color: Vec4): void => {
			const startIndex = vertices.length
			vertices.push(...quadVertices)
			addTriangle([startIndex, startIndex + 1, startIndex + 2], color)
			addTriangle([startIndex, startIndex + 2, startIndex + 3], color)
		}

		for (const vertex of octaVertices) {
			vertices.push([
				vertex[0] * scale,
				vertex[1] * scale,
				vertex[2] * scale,
			])
		}

		octaFaces.forEach((face, index) => {
			addTriangle([face[0]!, face[1]!, face[2]!], OctahedronScene.getFaceColorByIndex(index))
		})

		const roomSize = 18
		const halfSize = roomSize / 2
		const floorY = -2
		const ceilingY = 4

		addQuad([
			[-halfSize, floorY, -halfSize],
			[-halfSize, floorY, halfSize],
			[halfSize, floorY, halfSize],
			[halfSize, floorY, -halfSize],
		], OctahedronScene.FLOOR_COLOR)

		addQuad([
			[-halfSize, ceilingY, -halfSize],
			[halfSize, ceilingY, -halfSize],
			[halfSize, ceilingY, halfSize],
			[-halfSize, ceilingY, halfSize],
		], OctahedronScene.CEILING_COLOR)

		const edgeIndicesArray: number[] = [...edgeSet].flatMap(
			edge => OctahedronScene.getVerticesFromEdge(edge),
		)

		const scaledVertices = new Float32Array(vertices.flatMap(vec3 => [
			vec3[0],
			vec3[1],
			vec3[2],
		]))

		return {
			vertices: scaledVertices,
			faces,
			edgeIndices: new Uint16Array(edgeIndicesArray),
		}
	}
}

export {
	OctahedronScene,
}
