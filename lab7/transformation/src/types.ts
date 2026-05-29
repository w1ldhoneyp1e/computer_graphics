type Vec3 = [number, number, number]
type Mat4 = Float32Array

type OrbitCameraState = {
	yaw: number,
	pitch: number,
	distance: number,
}

type SurfaceGrid = {
	vertices: Float32Array,
	lineIndices: Uint16Array,
	triangleIndices: Uint16Array,
}

export {
	type Mat4,
	type OrbitCameraState,
	type SurfaceGrid,
	type Vec3,
}
