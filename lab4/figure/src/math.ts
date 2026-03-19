import {type Mat4, type Vec3} from './types'

function vec3Add(a: Vec3, b: Vec3): Vec3 {
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0],
	]
}

function vec3Dot(a: Vec3, b: Vec3): number {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function vec3Length(v: Vec3): number {
	return Math.hypot(v[0], v[1], v[2])
}

function vec3Normalize(v: Vec3): Vec3 {
	const length = vec3Length(v)
	if (length === 0) {
		return [0, 0, 0]
	}

	return [v[0] / length, v[1] / length, v[2] / length]
}

function vec3Scale(v: Vec3, scalar: number): Vec3 {
	return [v[0] * scalar, v[1] * scalar, v[2] * scalar]
}

function vec3Subtract(a: Vec3, b: Vec3): Vec3 {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function mat4Identity(): Mat4 {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	])
}

function mat4LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
	const zAxis = vec3Normalize(vec3Subtract(eye, center))
	const xAxis = vec3Normalize(vec3Cross(up, zAxis))
	const yAxis = vec3Cross(zAxis, xAxis)

	return new Float32Array([
		xAxis[0], yAxis[0], zAxis[0], 0,
		xAxis[1], yAxis[1], zAxis[1], 0,
		xAxis[2], yAxis[2], zAxis[2], 0,
		-vec3Dot(xAxis, eye), -vec3Dot(yAxis, eye), -vec3Dot(zAxis, eye), 1,
	])
}

function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
	const out = new Float32Array(16)
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			out[c * 4 + r]
				= a[r]! * b[c * 4]!
				+ a[4 + r]! * b[c * 4 + 1]!
				+ a[8 + r]! * b[c * 4 + 2]!
				+ a[12 + r]! * b[c * 4 + 3]!
		}
	}

	return out
}

function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
	const f = 1 / Math.tan(fovY / 2)
	const nf = 1 / (near - far)

	return new Float32Array([
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (far + near) * nf, -1,
		0, 0, 2 * far * near * nf, 0,
	])
}

function createMvpMatrix(aspectRatio: number, cameraPosition: Vec3): Float32Array {
	const projection = mat4Perspective(Math.PI / 4, aspectRatio, 0.1, 100)
	const view = mat4LookAt(cameraPosition, [0, 0, 0], [0, 1, 0])
	const model = mat4Identity()

	return mat4Multiply(projection, mat4Multiply(view, model))
}

export {
	mat4Identity,
	mat4LookAt,
	mat4Multiply,
	mat4Perspective,
	createMvpMatrix,
	vec3Add,
	vec3Cross,
	vec3Dot,
	vec3Length,
	vec3Normalize,
	vec3Scale,
	vec3Subtract,
}

