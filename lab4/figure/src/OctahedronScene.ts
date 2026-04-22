import {
	vec3Add,
	vec3Cross,
	vec3Normalize,
	vec3Scale,
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
	]

	constructor({
		scale = 1.6,
		lightDirection = [0.8, 1.3, 0.5],
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
		const octaVertices = OctahedronScene.createOctahedronVertices()
		const octaFaces = OctahedronScene.createOctahedronFaces()
		const edgeSet = new Set<Edge>()

		const faces: FigureGeometry['faces'] = octaFaces.map((face, index) => {
			const a = octaVertices[face[0]!]!
			const b = octaVertices[face[1]!]!
			const c = octaVertices[face[2]!]!

			for (let i = 0; i < face.length; i++) {
				edgeSet.add(OctahedronScene.makeEdgeKey(
					face[i]!,
					face[(i + 1) % face.length]!,
				))
			}

			const cross = vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))
			const verticesSum = face.reduce<Vec3>(
				(acc, vertexId) => vec3Add(acc, octaVertices[vertexId]!),
				[0, 0, 0],
			)

			return {
				indices: new Uint16Array(face),
				normal: vec3Normalize(cross),
				center: vec3Scale(verticesSum, 1 / face.length),
				color: OctahedronScene.getFaceColorByIndex(index),
			}
		})

		const edgeIndicesArray: number[] = [...edgeSet].flatMap(
			edge => OctahedronScene.getVerticesFromEdge(edge),
		)

		const scaledVertices = new Float32Array(octaVertices.flatMap(vec3 => [
			vec3[0] * scale,
			vec3[1] * scale,
			vec3[2] * scale,
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
