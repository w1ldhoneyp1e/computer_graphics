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

type Cell = 0 | 1

type MazeSceneConstructor = {
	lightDirection?: Vec3,
}

type FaceAccumulator = {
	vertices: Vec3[],
	faces: FigureGeometry['faces'],
	edgeSet: Set<Edge>,
}

class MazeScene implements FigureScene {
	readonly geometry: FigureGeometry
	readonly lightDirection: Vec3

	private static readonly WALL_COLOR: Vec4 = [0.82, 0.28, 0.24, 1.0]
	private static readonly FLOOR_COLOR: Vec4 = [0.24, 0.40, 0.78, 1.0]
	private static readonly CEILING_COLOR: Vec4 = [0.87, 0.83, 0.68, 1.0]
	private static readonly WALL_HEIGHT = 2.5
	private static readonly MAZE: Cell[][] = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
		[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
		[1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
		[1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
		[1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
		[1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	]

	constructor({
		lightDirection = [-3, -4, -2],
	}: MazeSceneConstructor = {}) {
		this.geometry = MazeScene.createMazeGeometry()
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

	private static addTriangle(
		acc: FaceAccumulator,
		triangle: [number, number, number],
		color: Vec4,
	): void {
		const a = acc.vertices[triangle[0]]!
		const b = acc.vertices[triangle[1]]!
		const c = acc.vertices[triangle[2]]!

		for (let i = 0; i < triangle.length; i++) {
			acc.edgeSet.add(MazeScene.makeEdgeKey(
				triangle[i]!,
				triangle[(i + 1) % triangle.length]!,
			))
		}

		acc.faces.push({
			indices: new Uint16Array(triangle),
			normal: vec3Normalize(vec3Cross(vec3Subtract(b, a), vec3Subtract(c, a))),
			color,
		})
	}

	private static addQuad(
		acc: FaceAccumulator,
		quadVertices: [Vec3, Vec3, Vec3, Vec3],
		color: Vec4,
	): void {
		const start = acc.vertices.length
		acc.vertices.push(...quadVertices)
		MazeScene.addTriangle(acc, [start, start + 1, start + 2], color)
		MazeScene.addTriangle(acc, [start, start + 2, start + 3], color)
	}

	private static isWall(row: number, column: number): boolean {
		if (row < 0 || row >= MazeScene.MAZE.length) {
			return false
		}

		const mazeRow = MazeScene.MAZE[row]!
		if (column < 0 || column >= mazeRow.length) {
			return false
		}

		return mazeRow[column] === 1
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

		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const x0 = column - xOffset
				const x1 = x0 + 1
				const z0 = row - zOffset
				const z1 = z0 + 1

				MazeScene.addQuad(acc, [
					[x0, floorY, z0],
					[x0, floorY, z1],
					[x1, floorY, z1],
					[x1, floorY, z0],
				], MazeScene.FLOOR_COLOR)

				MazeScene.addQuad(acc, [
					[x0, ceilingY, z0],
					[x1, ceilingY, z0],
					[x1, ceilingY, z1],
					[x0, ceilingY, z1],
				], MazeScene.CEILING_COLOR)

				if (!MazeScene.isWall(row, column)) {
					continue
				}

				if (!MazeScene.isWall(row - 1, column)) {
					MazeScene.addQuad(acc, [
						[x0, floorY, z0],
						[x1, floorY, z0],
						[x1, ceilingY, z0],
						[x0, ceilingY, z0],
					], MazeScene.WALL_COLOR)
				}

				if (!MazeScene.isWall(row + 1, column)) {
					MazeScene.addQuad(acc, [
						[x1, floorY, z1],
						[x0, floorY, z1],
						[x0, ceilingY, z1],
						[x1, ceilingY, z1],
					], MazeScene.WALL_COLOR)
				}

				if (!MazeScene.isWall(row, column - 1)) {
					MazeScene.addQuad(acc, [
						[x0, floorY, z1],
						[x0, floorY, z0],
						[x0, ceilingY, z0],
						[x0, ceilingY, z1],
					], MazeScene.WALL_COLOR)
				}

				if (!MazeScene.isWall(row, column + 1)) {
					MazeScene.addQuad(acc, [
						[x1, floorY, z0],
						[x1, floorY, z1],
						[x1, ceilingY, z1],
						[x1, ceilingY, z0],
					], MazeScene.WALL_COLOR)
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
