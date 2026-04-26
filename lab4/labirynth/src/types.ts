type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Mat4 = Float32Array

type Edge = `${number}-${number}`

type FigureFace = {
	indices: Uint16Array,
	normal: Vec3,
	color: Vec4,
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

type FirstPersonCameraState = {
	yaw: number,
	pitch: number,
	distance: number,
}

export {
	type FigureFace,
	type FigureGeometry,
	type FigureScene,
	type Mat4,
	type FirstPersonCameraState,
	type Vec3,
	type Vec4,
	type Edge,
}
