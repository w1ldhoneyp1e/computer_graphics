import {resizeCanvasToDisplaySize} from './canvas'
import {createMvpMatrix} from './math'
import {type OrbitCamera} from './OrbitCamera'
import {FACE_FRAGMENT_SHADER, FACE_VERTEX_SHADER} from './shaders'
import {type FigureScene} from './types'
import {
	createBuffer,
	createProgram,
	requireAttribLocation,
	requireUniformLocation,
} from './webgl'

type FaceRenderData = {
	indexBuffer: WebGLBuffer,
	indexCount: number,
}

type FaceResources = {
	program: WebGLProgram,
	positionLocation: number,
	normalLocation: number,
	mvpLocation: WebGLUniformLocation,
	lightDirectionLocation: WebGLUniformLocation,
	minYLocation: WebGLUniformLocation,
	maxYLocation: WebGLUniformLocation,
}

type FigureRendererDeps = {
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	scene: FigureScene,
}

class FigureRenderer {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly scene: FigureScene
	private readonly vertexBuffer: WebGLBuffer
	private readonly normalBuffer: WebGLBuffer
	private readonly faceRenderData: FaceRenderData[]
	private readonly face: FaceResources

	constructor({
		canvas,
		gl,
		scene,
	}: FigureRendererDeps) {
		this.canvas = canvas
		this.gl = gl
		this.scene = scene

		this.vertexBuffer = createBuffer(this.gl, this.gl.ARRAY_BUFFER, scene.geometry.vertices)
		this.normalBuffer = createBuffer(this.gl, this.gl.ARRAY_BUFFER, scene.geometry.normals)

		this.faceRenderData = scene.geometry.faces.map(face => ({
			indexBuffer: createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, face.indices),
			indexCount: face.indices.length,
		}))

		const faceProgram = createProgram(this.gl, FACE_VERTEX_SHADER, FACE_FRAGMENT_SHADER)

		this.face = {
			program: faceProgram,
			positionLocation: requireAttribLocation(this.gl, faceProgram, 'a_position'),
			normalLocation: requireAttribLocation(this.gl, faceProgram, 'a_normal'),
			mvpLocation: requireUniformLocation(this.gl, faceProgram, 'u_mvp'),
			lightDirectionLocation: requireUniformLocation(this.gl, faceProgram, 'u_lightDir'),
			minYLocation: requireUniformLocation(this.gl, faceProgram, 'u_minY'),
			maxYLocation: requireUniformLocation(this.gl, faceProgram, 'u_maxY'),
		}

		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.clearColor(0.80, 0.80, 0.80, 1)
	}

	private drawFaces(cullMode: number): void {
		const gl = this.gl

		gl.cullFace(cullMode)
		for (const faceData of this.faceRenderData) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceData.indexBuffer)
			gl.drawElements(gl.TRIANGLES, faceData.indexCount, gl.UNSIGNED_SHORT, 0)
		}
	}

	private drawTransparentFaces(mvp: Float32Array): void {
		const gl = this.gl
		gl.depthMask(false)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.enable(gl.CULL_FACE)

		const face = this.face

		gl.useProgram(face.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.enableVertexAttribArray(face.positionLocation)
		gl.vertexAttribPointer(face.positionLocation, 3, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
		gl.enableVertexAttribArray(face.normalLocation)
		gl.vertexAttribPointer(face.normalLocation, 3, gl.FLOAT, false, 0, 0)
		gl.uniformMatrix4fv(face.mvpLocation, false, mvp)
		gl.uniform3fv(face.lightDirectionLocation, new Float32Array(this.scene.lightDirection))
		gl.uniform1f(face.minYLocation, this.scene.geometry.minY)
		gl.uniform1f(face.maxYLocation, this.scene.geometry.maxY)

		this.drawFaces(gl.FRONT)
		this.drawFaces(gl.BACK)

		gl.depthMask(true)
		gl.disable(gl.CULL_FACE)
	}

	renderFrame(camera: OrbitCamera): void {
		resizeCanvasToDisplaySize(this.canvas)

		const gl = this.gl
		gl.viewport(0, 0, this.canvas.width, this.canvas.height)

		const aspectRatio = this.canvas.width / this.canvas.height
		const cameraPosition = camera.getPosition()
		const mvp = createMvpMatrix(aspectRatio, cameraPosition)

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		this.drawTransparentFaces(mvp)
	}
}

export {
	FigureRenderer,
}
