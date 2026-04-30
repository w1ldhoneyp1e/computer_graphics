type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Mat4 = Float32Array

type Edge = `${number}-${number}`

type FigureFace = {
	indices: Uint16Array,
	vertices: Float32Array,
	normal: Vec3,
	texCoords: Float32Array,
	textureId: number,
}

type FigureGeometry = {
	vertices: Float32Array,
	faces: FigureFace[],
	edgeIndices: Uint16Array,
}

type FigureScene = {
	readonly geometry: FigureGeometry,
	readonly lightDirection: Vec3,
}

type MazeNavigator = {
	getSpawnPosition: () => Vec3,
	isPositionWalkable: (position: Vec3, radius: number) => boolean,
}

type FirstPersonCameraState = {
	position: Vec3,
	yaw: number,
	pitch: number,
}

export {
	type FigureFace,
	type FigureGeometry,
	type MazeNavigator,
	type FigureScene,
	type Mat4,
	type FirstPersonCameraState,
	type Vec3,
	type Vec4,
	type Edge,
}
