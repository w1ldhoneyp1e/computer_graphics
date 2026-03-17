import {createOrbitCameraController} from './camera'
import {createDodecahedronGeometry} from './dodecahedron'
import {mat4Identity, mat4LookAt, mat4Multiply, mat4Perspective} from './math'
import {type Mat4, type Vec3, type Vec4} from './types'
import {createBuffer, createProgram, requireAttribLocation, requireUniformLocation} from './webgl'

type FaceRenderData = {
	indexBuffer: WebGLBuffer,
	indexCount: number,
	normal: Vec3,
	color: Vec4,
}

const FACE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
uniform vec3 u_normal;
uniform vec4 u_color;
uniform vec3 u_lightDir;
varying vec4 v_color;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	float diffuse = max(dot(normalize(u_normal), normalize(-u_lightDir)), 0.0);
	float lightAmount = 0.22 + 0.78 * diffuse;
	v_color = vec4(u_color.rgb * lightAmount, u_color.a);
}
`

const FACE_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;
void main() {
	gl_FragColor = v_color;
}
`

const EDGE_VERTEX_SHADER = `
attribute vec3 a_position;
uniform mat4 u_mvp;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
}
`

const EDGE_FRAGMENT_SHADER = `
precision mediump float;
void main() {
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
`

function getCanvas(): HTMLCanvasElement {
	const canvas = document.getElementById('app')
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas не найден')
	}

	return canvas
}

function getGl(canvas: HTMLCanvasElement): WebGLRenderingContext {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: true,
	})
	if (!gl) {
		throw new Error('WebGL не поддерживается')
	}

	return gl
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
	const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
	const width = Math.floor(canvas.clientWidth * dpr)
	const height = Math.floor(canvas.clientHeight * dpr)
	if (canvas.width === width && canvas.height === height) {
		return
	}

	canvas.width = width
	canvas.height = height
}

function createMvpMatrix(aspectRatio: number, cameraPosition: Vec3): Mat4 {
	const projection = mat4Perspective(Math.PI / 4, aspectRatio, 0.1, 100)
	const view = mat4LookAt(cameraPosition, [0, 0, 0], [0, 1, 0])
	const model = mat4Identity()

	return mat4Multiply(projection, mat4Multiply(view, model))
}

function cameraPositionFromOrbit(yaw: number, pitch: number, distance: number): Vec3 {
	const x = distance * Math.cos(pitch) * Math.sin(yaw)
	const y = distance * Math.sin(pitch)
	const z = distance * Math.cos(pitch) * Math.cos(yaw)

	return [x, y, z]
}

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const camera = createOrbitCameraController(canvas)
	const geometry = createDodecahedronGeometry()

	const vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, geometry.vertices)
	const edgeIndexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, geometry.edgeIndices)
	const faceRenderData: FaceRenderData[] = geometry.faces.map(face => ({
		indexBuffer: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, face.indices),
		indexCount: face.indices.length,
		normal: face.normal,
		color: face.color,
	}))

	const faceProgram = createProgram(gl, FACE_VERTEX_SHADER, FACE_FRAGMENT_SHADER)
	const facePositionLocation = requireAttribLocation(gl, faceProgram, 'a_position')
	const faceMvpLocation = requireUniformLocation(gl, faceProgram, 'u_mvp')
	const faceNormalLocation = requireUniformLocation(gl, faceProgram, 'u_normal')
	const faceColorLocation = requireUniformLocation(gl, faceProgram, 'u_color')
	const faceLightDirectionLocation = requireUniformLocation(gl, faceProgram, 'u_lightDir')

	const edgeProgram = createProgram(gl, EDGE_VERTEX_SHADER, EDGE_FRAGMENT_SHADER)
	const edgePositionLocation = requireAttribLocation(gl, edgeProgram, 'a_position')
	const edgeMvpLocation = requireUniformLocation(gl, edgeProgram, 'u_mvp')

	const lightDirection: Vec3 = [0.8, 1.3, 0.5]
	gl.enable(gl.DEPTH_TEST)
	gl.clearColor(0.08, 0.1, 0.16, 1)

	function render(): void {
		resizeCanvasToDisplaySize(canvas)
		gl.viewport(0, 0, canvas.width, canvas.height)
		const aspectRatio = canvas.width / canvas.height
		const cameraPosition = cameraPositionFromOrbit(
			camera.state.yaw,
			camera.state.pitch,
			camera.state.distance,
		)
		const mvp = createMvpMatrix(aspectRatio, cameraPosition)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		gl.depthMask(true)
		gl.disable(gl.BLEND)
		gl.disable(gl.CULL_FACE)
		gl.useProgram(edgeProgram)
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
		gl.enableVertexAttribArray(edgePositionLocation)
		gl.vertexAttribPointer(edgePositionLocation, 3, gl.FLOAT, false, 0, 0)
		gl.uniformMatrix4fv(edgeMvpLocation, false, mvp)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer)
		gl.drawElements(gl.LINES, geometry.edgeIndices.length, gl.UNSIGNED_SHORT, 0)

		gl.depthMask(false)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.enable(gl.CULL_FACE)
		gl.useProgram(faceProgram)
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
		gl.enableVertexAttribArray(facePositionLocation)
		gl.vertexAttribPointer(facePositionLocation, 3, gl.FLOAT, false, 0, 0)
		gl.uniformMatrix4fv(faceMvpLocation, false, mvp)
		gl.uniform3fv(faceLightDirectionLocation, new Float32Array(lightDirection))

		gl.cullFace(gl.FRONT)
		for (const face of faceRenderData) {
			gl.uniform3fv(faceNormalLocation, new Float32Array(face.normal))
			gl.uniform4fv(faceColorLocation, new Float32Array(face.color))
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, face.indexBuffer)
			gl.drawElements(gl.TRIANGLES, face.indexCount, gl.UNSIGNED_SHORT, 0)
		}

		gl.cullFace(gl.BACK)
		for (const face of faceRenderData) {
			gl.uniform3fv(faceNormalLocation, new Float32Array(face.normal))
			gl.uniform4fv(faceColorLocation, new Float32Array(face.color))
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, face.indexBuffer)
			gl.drawElements(gl.TRIANGLES, face.indexCount, gl.UNSIGNED_SHORT, 0)
		}
		gl.depthMask(true)
		gl.disable(gl.CULL_FACE)
		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}

main()
