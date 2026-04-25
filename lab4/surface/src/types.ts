type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Mat4 = Float32Array

type Edge = `${number}-${number}`

type FigureFace = {
	indices: Uint16Array,
}

type FigureGeometry = {
	vertices: Float32Array,
	normals: Float32Array,
	faces: FigureFace[],
	edgeIndices: Uint16Array,
	minY: number,
	maxY: number,
}

type FigureScene = {
	readonly geometry: FigureGeometry,
	readonly lightDirection: Vec3,
}

type OrbitCameraState = {
	yaw: number,
	pitch: number,
	distance: number,
}

export {
	type FigureFace,
	type FigureGeometry,
	type FigureScene,
	type Mat4,
	type OrbitCameraState,
	type Vec3,
	type Vec4,
	type Edge,
}
