import {
	vec3Add,
	vec3Cross,
	vec3Normalize,
	vec3Scale,
	vec3Subtract,
} from './math'
import {
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

	private static makeEdgeKey(a: number, b: number): string {
		return a < b
			? `${a}-${b}`
			: `${b}-${a}`
	}

	private static createOctahedronGeometry(scale = 1.6): FigureGeometry {
		const octaVertices = OctahedronScene.createOctahedronVertices()
		const octaFaces = OctahedronScene.createOctahedronFaces()
		const edgeSet = new Set<string>()
		const faces: FigureGeometry['faces'] = []

		for (let faceIndex = 0; faceIndex < octaFaces.length; faceIndex++) {
			const face = octaFaces[faceIndex]!
			const a = octaVertices[face[0]!]!
			const b = octaVertices[face[1]!]!
			const c = octaVertices[face[2]!]!

			for (let i = 0; i < face.length; i++) {
				edgeSet.add(OctahedronScene.makeEdgeKey(
					face[i]!,
					face[(i + 1) % face.length]!,
				))
			}

			faces.push({
				indices: new Uint16Array(face),
				normal: vec3Normalize(vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))),
				center: vec3Scale(face.reduce<Vec3>(
					(acc, vertexId) => vec3Add(acc, octaVertices[vertexId]!), [0, 0, 0],
				), 1 / face.length),
				color: OctahedronScene.FACE_PALETTE[faceIndex % OctahedronScene.FACE_PALETTE.length]!,
			})
		}

		const edgeIndicesArray: number[] = []
		for (const edgeKey of edgeSet) {
			const [a, b] = edgeKey.split('-').map(part => Number(part))
			if (a === undefined || b === undefined) {
				continue
			}

			edgeIndicesArray.push(a, b)
		}

		const scaledVertices = new Float32Array(octaVertices.length * 3)
		for (let i = 0; i < octaVertices.length; i++) {
			const vertex = octaVertices[i]!
			scaledVertices[i * 3] = vertex[0] * scale
			scaledVertices[i * 3 + 1] = vertex[1] * scale
			scaledVertices[i * 3 + 2] = vertex[2] * scale
		}

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
