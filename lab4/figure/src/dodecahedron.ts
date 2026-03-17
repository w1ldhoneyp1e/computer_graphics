import {
	vec3Add,
	vec3Cross,
	vec3Dot,
	vec3Normalize,
	vec3Scale,
	vec3Subtract,
} from './math'
import {type DodecahedronFace, type DodecahedronGeometry, type Vec3, type Vec4} from './types'

const FACE_PALETTE: Vec4[] = [
	[0.93, 0.25, 0.25, 0.44],
	[0.25, 0.82, 0.42, 0.44],
	[0.23, 0.55, 0.95, 0.44],
	[0.95, 0.75, 0.22, 0.44],
]

function createIcosahedronVertices(): Vec3[] {
	const phi = (1 + Math.sqrt(5)) / 2
	const raw: Vec3[] = [
		[-1, phi, 0],
		[1, phi, 0],
		[-1, -phi, 0],
		[1, -phi, 0],
		[0, -1, phi],
		[0, 1, phi],
		[0, -1, -phi],
		[0, 1, -phi],
		[phi, 0, -1],
		[phi, 0, 1],
		[-phi, 0, -1],
		[-phi, 0, 1],
	]

	return raw.map(vertex => vec3Normalize(vertex))
}

function createIcosahedronFaces(): number[][] {
	return [
		[0, 11, 5],
		[0, 5, 1],
		[0, 1, 7],
		[0, 7, 10],
		[0, 10, 11],
		[1, 5, 9],
		[5, 11, 4],
		[11, 10, 2],
		[10, 7, 6],
		[7, 1, 8],
		[3, 9, 4],
		[3, 4, 2],
		[3, 2, 6],
		[3, 6, 8],
		[3, 8, 9],
		[4, 9, 5],
		[2, 4, 11],
		[6, 2, 10],
		[8, 6, 7],
		[9, 8, 1],
	]
}

function getFaceCenter(vertices: Vec3[], face: number[]): Vec3 {
	let sum: Vec3 = [0, 0, 0]
	for (const index of face) {
		sum = vec3Add(sum, vertices[index] as Vec3)
	}

	return vec3Normalize(vec3Scale(sum, 1 / face.length))
}

function sortAdjacentCenters(
	icosaVertex: Vec3,
	centers: Array<{index: number, center: Vec3}>,
): number[] {
	const axis = vec3Normalize(icosaVertex)
	const firstProjected = vec3Subtract(
		centers[0]!.center,
		vec3Scale(axis, vec3Dot(centers[0]!.center, axis)),
	)
	const tangent = vec3Normalize(firstProjected)
	const bitangent = vec3Normalize(vec3Cross(axis, tangent))
	const sorted = centers
		.map(item => {
			const projected = vec3Subtract(
				item.center,
				vec3Scale(axis, vec3Dot(item.center, axis)),
			)
			const x = vec3Dot(projected, tangent)
			const y = vec3Dot(projected, bitangent)

			return {
				index: item.index,
				angle: Math.atan2(y, x),
			}
		})
		.sort((a, b) => a.angle - b.angle)

	return sorted.map(item => item.index)
}

function makeEdgeKey(a: number, b: number): string {
	return a < b ? `${a}-${b}` : `${b}-${a}`
}

function assignFaceColors(facesAsPentagons: number[][]): Vec4[] {
	const adjacency = new Map<number, Set<number>>()
	for (let i = 0; i < facesAsPentagons.length; i++) {
		adjacency.set(i, new Set<number>())
	}
	const edgeOwner = new Map<string, number>()

	for (let faceIndex = 0; faceIndex < facesAsPentagons.length; faceIndex++) {
		const face = facesAsPentagons[faceIndex]!
		for (let i = 0; i < face.length; i++) {
			const a = face[i]!
			const b = face[(i + 1) % face.length]!
			const edgeKey = makeEdgeKey(a, b)
			const otherFaceIndex = edgeOwner.get(edgeKey)
			if (otherFaceIndex === undefined) {
				edgeOwner.set(edgeKey, faceIndex)
			} else {
				adjacency.get(faceIndex)!.add(otherFaceIndex)
				adjacency.get(otherFaceIndex)!.add(faceIndex)
			}
		}
	}

	const colorIds = new Array<number>(facesAsPentagons.length).fill(-1)
	for (let faceIndex = 0; faceIndex < facesAsPentagons.length; faceIndex++) {
		const busyColors = new Set<number>()
		for (const neighborFaceIndex of adjacency.get(faceIndex)!) {
			const neighborColor = colorIds[neighborFaceIndex]
			if (neighborColor !== undefined && neighborColor !== -1) {
				busyColors.add(neighborColor)
			}
		}
		for (let paletteIndex = 0; paletteIndex < FACE_PALETTE.length; paletteIndex++) {
			if (!busyColors.has(paletteIndex)) {
				colorIds[faceIndex] = paletteIndex
				break
			}
		}
		if (colorIds[faceIndex] === -1) {
			colorIds[faceIndex] = 0
		}
	}

	return colorIds.map(index => FACE_PALETTE[index]!)
}

function createDodecahedronGeometry(scale = 1.6): DodecahedronGeometry {
	const icosaVertices = createIcosahedronVertices()
	const icosaFaces = createIcosahedronFaces()
	const dodecaVertices = icosaFaces.map(face => getFaceCenter(icosaVertices, face))
	const incidentFaces = new Map<number, Array<{index: number, center: Vec3}>>()
	for (let i = 0; i < icosaVertices.length; i++) {
		incidentFaces.set(i, [])
	}
	for (let faceIndex = 0; faceIndex < icosaFaces.length; faceIndex++) {
		const face = icosaFaces[faceIndex]!
		for (const vertexIndex of face) {
			incidentFaces.get(vertexIndex)!.push({
				index: faceIndex,
				center: dodecaVertices[faceIndex]!,
			})
		}
	}

	const facesAsPentagons: number[][] = []
	for (let vertexIndex = 0; vertexIndex < icosaVertices.length; vertexIndex++) {
		const centerList = incidentFaces.get(vertexIndex)!
		const orderedFaceIndices = sortAdjacentCenters(icosaVertices[vertexIndex]!, centerList)
		const first = dodecaVertices[orderedFaceIndices[0]!]!
		const second = dodecaVertices[orderedFaceIndices[1]!]!
		const third = dodecaVertices[orderedFaceIndices[2]!]!
		const normal = vec3Normalize(vec3Cross(vec3Subtract(second, first), vec3Subtract(third, first)))
		const center = vec3Normalize(
			vec3Scale(
				orderedFaceIndices.reduce<Vec3>((acc, faceId) => vec3Add(acc, dodecaVertices[faceId]!), [0, 0, 0]),
				1 / orderedFaceIndices.length,
			),
		)
		if (vec3Dot(normal, center) < 0) {
			facesAsPentagons.push([...orderedFaceIndices].reverse())
		} else {
			facesAsPentagons.push(orderedFaceIndices)
		}
	}

	const faceColors = assignFaceColors(facesAsPentagons)
	const faces: DodecahedronFace[] = []
	for (let faceIndex = 0; faceIndex < facesAsPentagons.length; faceIndex++) {
		const pentagon = facesAsPentagons[faceIndex]!
		const a = dodecaVertices[pentagon[0]!]!
		const b = dodecaVertices[pentagon[1]!]!
		const c = dodecaVertices[pentagon[2]!]!
		const faceNormal = vec3Normalize(vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a)))
		const faceCenter = vec3Scale(
			pentagon.reduce<Vec3>((acc, vertexId) => vec3Add(acc, dodecaVertices[vertexId]!), [0, 0, 0]),
			1 / pentagon.length,
		)
		const triangleIndices = new Uint16Array([
			pentagon[0]!, pentagon[1]!, pentagon[2]!,
			pentagon[0]!, pentagon[2]!, pentagon[3]!,
			pentagon[0]!, pentagon[3]!, pentagon[4]!,
		])
		faces.push({
			indices: triangleIndices,
			normal: faceNormal,
			center: faceCenter,
			color: faceColors[faceIndex]!,
		})
	}

	const edgeSet = new Set<string>()
	for (const pentagon of facesAsPentagons) {
		for (let i = 0; i < pentagon.length; i++) {
			edgeSet.add(makeEdgeKey(pentagon[i]!, pentagon[(i + 1) % pentagon.length]!))
		}
	}
	const edgeIndicesArray: number[] = []
	for (const edgeKey of edgeSet) {
		const [a, b] = edgeKey.split('-').map(part => Number(part))
		if (a === undefined || b === undefined) {
			continue
		}

		edgeIndicesArray.push(a, b)
	}

	const scaledVertices = new Float32Array(dodecaVertices.length * 3)
	for (let i = 0; i < dodecaVertices.length; i++) {
		const vertex = dodecaVertices[i]!
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

export {
	createDodecahedronGeometry,
}
