import {
	vec3Cross,
	vec3Normalize,
	vec3Subtract,
} from './math'
import {
	type Edge,
	type FigureGeometry,
	type FigureScene,
	type MazeNavigator,
	type Vec3,
} from './types'

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6

type MazeSceneConstructor = {
	lightDirection?: Vec3,
}

type FaceAccumulator = {
	vertices: Vec3[],
	faces: FigureGeometry['faces'],
	edgeSet: Set<Edge>,
}

class MazeScene implements FigureScene, MazeNavigator {
	readonly geometry: FigureGeometry
	readonly lightDirection: Vec3

	static readonly FLOOR_TEXTURE_ID = 0
	static readonly CEILING_TEXTURE_ID = 4

	private static readonly WALL_HEIGHT = 2.5
	private static readonly CELL_SIZE = 2
	private static readonly MAZE: Cell[][] = [
		[2, 2, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5],
		[2, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[2, 0, 2, 5, 5, 0, 5, 0, 6, 6, 2, 2, 2, 2, 0, 1],
		[2, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 2, 0, 1],
		[2, 0, 2, 0, 5, 5, 5, 6, 6, 6, 2, 2, 0, 2, 0, 1],
		[2, 0, 2, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 1],
		[2, 0, 2, 0, 6, 0, 1, 1, 1, 1, 0, 2, 0, 2, 0, 1],
		[2, 0, 2, 0, 6, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1],
		[2, 0, 2, 0, 6, 6, 6, 6, 0, 1, 0, 2, 3, 2, 0, 1],
		[2, 0, 2, 0, 0, 0, 0, 6, 0, 1, 0, 0, 0, 2, 0, 1],
		[2, 0, 3, 3, 3, 3, 0, 6, 0, 1, 2, 2, 0, 2, 0, 1],
		[2, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1],
		[2, 3, 3, 3, 0, 3, 4, 4, 0, 1, 0, 2, 2, 2, 0, 1],
		[4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 0, 0, 0, 1],
		[4, 0, 4, 4, 4, 4, 0, 4, 1, 1, 0, 2, 0, 2, 0, 1],
		[4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 2, 2, 2, 1],
	]
	private static readonly DEFAULT_TEX_COORDS = new Float32Array([
		0, 0,
		1, 0,
		1, 1,
		0, 1,
	])

	constructor({
		lightDirection = [-3, -4, -2],
	}: MazeSceneConstructor = {}) {
		this.geometry = MazeScene.createMazeGeometry()
		this.lightDirection = lightDirection
	}

	getSpawnPosition(): Vec3 {
		return MazeScene.getCellCenter(1, 1, 1.2)
	}

	isPositionWalkable(position: Vec3, radius: number): boolean {
		const checks: [number, number][] = [
			[-radius, -radius],
			[-radius, radius],
			[radius, -radius],
			[radius, radius],
		]

		return checks.every(([dx, dz]) => {
			const row = MazeScene.getRowFromWorldZ(position[2] + dz)
			const column = MazeScene.getColumnFromWorldX(position[0] + dx)

			return !MazeScene.isWall(row, column)
		})
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

	private static addTriangle({
		acc,
		triangle,
		quadStartIndex,
		quadTexCoords,
		textureId,
	}: {
		acc: FaceAccumulator,
		triangle: [number, number, number],
		quadStartIndex: number,
		quadTexCoords: Float32Array,
		textureId: number,
	}): void {
		const a = acc.vertices[triangle[0]]!
		const b = acc.vertices[triangle[1]]!
		const c = acc.vertices[triangle[2]]!
		const localIndices: Vec3 = [
			triangle[0] - quadStartIndex,
			triangle[1] - quadStartIndex,
			triangle[2] - quadStartIndex,
		]
		const triangleVertices = new Float32Array([
			...a,
			...b,
			...c,
		])
		const triangleTexCoords = new Float32Array([
			quadTexCoords[localIndices[0] * 2]!,
			quadTexCoords[localIndices[0] * 2 + 1]!,
			quadTexCoords[localIndices[1] * 2]!,
			quadTexCoords[localIndices[1] * 2 + 1]!,
			quadTexCoords[localIndices[2] * 2]!,
			quadTexCoords[localIndices[2] * 2 + 1]!,
		])

		for (let i = 0; i < triangle.length; i++) {
			acc.edgeSet.add(MazeScene.makeEdgeKey(
				triangle[i]!,
				triangle[(i + 1) % triangle.length]!,
			))
		}

		acc.faces.push({
			indices: new Uint16Array([0, 1, 2]),
			vertices: triangleVertices,
			normal: vec3Normalize(vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))),
			texCoords: triangleTexCoords,
			textureId,
		})
	}

	private static addQuad(
		acc: FaceAccumulator,
		quadVertices: [Vec3, Vec3, Vec3, Vec3],
		textureId: number,
	): void {
		const start = acc.vertices.length
		acc.vertices.push(...quadVertices)
		MazeScene.addTriangle({
			acc,
			triangle: [start, start + 1, start + 2],
			quadStartIndex: start,
			quadTexCoords: MazeScene.DEFAULT_TEX_COORDS,
			textureId,
		})
		MazeScene.addTriangle({
			acc,
			triangle: [start, start + 2, start + 3],
			quadStartIndex: start,
			quadTexCoords: MazeScene.DEFAULT_TEX_COORDS,
			textureId,
		})
	}

	private static isWall(row: number, column: number): boolean {
		if (row < 0 || row >= MazeScene.MAZE.length) {
			return true
		}

		const mazeRow = MazeScene.MAZE[row]!
		if (column < 0 || column >= mazeRow.length) {
			return true
		}

		return mazeRow[column] !== 0
	}

	private static getColumnFromWorldX(x: number): number {
		const xOffset = MazeScene.MAZE[0]!.length / 2
		return Math.floor(x / MazeScene.CELL_SIZE + xOffset)
	}

	private static getRowFromWorldZ(z: number): number {
		const zOffset = MazeScene.MAZE.length / 2
		return Math.floor(z / MazeScene.CELL_SIZE + zOffset)
	}

	private static getCellCenter(row: number, column: number, y: number): Vec3 {
		const xOffset = MazeScene.MAZE[0]!.length / 2
		const zOffset = MazeScene.MAZE.length / 2

		return [
			(column - xOffset + 0.5) * MazeScene.CELL_SIZE,
			y,
			(row - zOffset + 0.5) * MazeScene.CELL_SIZE,
		]
	}

	private static createMazeGeometry(): FigureGeometry {
		const acc: FaceAccumulator = {
			vertices: [],
			faces: [],
			edgeSet: new Set<Edge>(),
		}

		const rows = MazeScene.MAZE.length
		const columns = MazeScene.MAZE[0]!.length
		const xOffset = columns / 2
		const zOffset = rows / 2
		const floorY = 0
		const ceilingY = MazeScene.WALL_HEIGHT
		const cellSize = MazeScene.CELL_SIZE

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const x0 = (column - xOffset) * cellSize
				const x1 = x0 + cellSize
				const z0 = (row - zOffset) * cellSize
				const z1 = z0 + cellSize

				MazeScene.addQuad(acc, [
					[x0, floorY, z0],
					[x0, floorY, z1],
					[x1, floorY, z1],
					[x1, floorY, z0],
				], MazeScene.FLOOR_TEXTURE_ID)

				MazeScene.addQuad(acc, [
					[x0, ceilingY, z0],
					[x1, ceilingY, z0],
					[x1, ceilingY, z1],
					[x0, ceilingY, z1],
				], MazeScene.CEILING_TEXTURE_ID)

				if (!MazeScene.isWall(row, column)) {
					continue
				}

				const wallType = MazeScene.MAZE[row]![column]!
				const textureId = wallType - 1

				if (!MazeScene.isWall(row - 1, column)) {
					MazeScene.addQuad(acc, [
						[x0, floorY, z0],
						[x1, floorY, z0],
						[x1, ceilingY, z0],
						[x0, ceilingY, z0],
					], textureId)
				}

				if (!MazeScene.isWall(row + 1, column)) {
					MazeScene.addQuad(acc, [
						[x1, floorY, z1],
						[x0, floorY, z1],
						[x0, ceilingY, z1],
						[x1, ceilingY, z1],
					], textureId)
				}

				if (!MazeScene.isWall(row, column - 1)) {
					MazeScene.addQuad(acc, [
						[x0, floorY, z1],
						[x0, floorY, z0],
						[x0, ceilingY, z0],
						[x0, ceilingY, z1],
					], textureId)
				}

				if (!MazeScene.isWall(row, column + 1)) {
					MazeScene.addQuad(acc, [
						[x1, floorY, z0],
						[x1, floorY, z1],
						[x1, ceilingY, z1],
						[x1, ceilingY, z0],
					], textureId)
				}
			}
		}

		return {
			vertices: new Float32Array(acc.vertices.flatMap(vertex => vertex)),
			faces: acc.faces,
			edgeIndices: new Uint16Array([...acc.edgeSet].flatMap(edge => MazeScene.getVerticesFromEdge(edge))),
		}
	}
}

export {
	MazeScene,
}
