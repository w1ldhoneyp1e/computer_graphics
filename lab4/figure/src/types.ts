type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Mat4 = Float32Array

type DodecahedronFace = {
	indices: Uint16Array,
	normal: Vec3,
	center: Vec3,
	color: Vec4,
}

type DodecahedronGeometry = {
	vertices: Float32Array,
	faces: DodecahedronFace[],
	edgeIndices: Uint16Array,
}

type FigureScene = {
	readonly geometry: DodecahedronGeometry,
	readonly lightDirection: Vec3,
}

type OrbitCameraState = {
	yaw: number,
	pitch: number,
	distance: number,
}

export {
	type DodecahedronFace,
	type DodecahedronGeometry,
	type FigureScene,
	type Mat4,
	type OrbitCameraState,
	type Vec3,
	type Vec4,
}
