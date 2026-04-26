import {resizeCanvasToDisplaySize} from './canvas'
import {createMvpMatrix} from './math'
import {type OrbitCamera} from './FirstPersonCamera'
import {
	EDGE_FRAGMENT_SHADER,
	EDGE_VERTEX_SHADER,
	FACE_FRAGMENT_SHADER,
	FACE_VERTEX_SHADER,
} from './shaders'
import {
	type FigureScene,
	type Vec3,
	type Vec4,
} from './types'
import {
	createBuffer,
	createProgram,
	requireAttribLocation,
	requireUniformLocation,
} from './webgl'

type FaceRenderData = {
	indexBuffer: WebGLBuffer,
	indexCount: number,
	normal: Vec3,
	color: Vec4,
}

type EdgeResources = {
	program: WebGLProgram,
	positionLocation: number,
	mvpLocation: WebGLUniformLocation,
}

type FaceResources = {
	program: WebGLProgram,
	positionLocation: number,
	mvpLocation: WebGLUniformLocation,
	normalLocation: WebGLUniformLocation,
	colorLocation: WebGLUniformLocation,
	lightDirectionLocation: WebGLUniformLocation,
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
	private readonly edgeIndexBuffer: WebGLBuffer
	private readonly faceRenderData: FaceRenderData[]
	private readonly faceResources: FaceResources
	private readonly edgeResources: EdgeResources

	constructor({
		canvas,
		gl,
		scene,
	}: FigureRendererDeps) {
		this.canvas = canvas
		this.gl = gl
		this.scene = scene

		this.vertexBuffer = createBuffer(this.gl, this.gl.ARRAY_BUFFER, scene.geometry.vertices)
		this.edgeIndexBuffer = createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, scene.geometry.edgeIndices)

		this.faceRenderData = scene.geometry.faces.map(face => ({
			indexBuffer: createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, face.indices),
			indexCount: face.indices.length,
			normal: face.normal,
			color: face.color,
		}))

		const faceProgram = createProgram(this.gl, FACE_VERTEX_SHADER, FACE_FRAGMENT_SHADER)
		const edgeProgram = createProgram(this.gl, EDGE_VERTEX_SHADER, EDGE_FRAGMENT_SHADER)

		this.faceResources = {
			program: faceProgram,
			positionLocation: requireAttribLocation(this.gl, faceProgram, 'a_position'),
			mvpLocation: requireUniformLocation(this.gl, faceProgram, 'u_mvp'),
			normalLocation: requireUniformLocation(this.gl, faceProgram, 'u_normal'),
			colorLocation: requireUniformLocation(this.gl, faceProgram, 'u_color'),
			lightDirectionLocation: requireUniformLocation(this.gl, faceProgram, 'u_lightDir'),
		}

		this.edgeResources = {
			program: edgeProgram,
			positionLocation: requireAttribLocation(this.gl, edgeProgram, 'a_position'),
			mvpLocation: requireUniformLocation(this.gl, edgeProgram, 'u_mvp'),
		}

		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.clearColor(0.80, 0.80, 0.80, 1)
	}

	private drawEdges(mvp: Float32Array): void {
		const gl = this.gl
		const geometry = this.scene.geometry

		gl.depthMask(true)
		gl.disable(gl.BLEND)
		gl.disable(gl.CULL_FACE)

		gl.useProgram(this.edgeResources.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.enableVertexAttribArray(this.edgeResources.positionLocation)
		gl.vertexAttribPointer(this.edgeResources.positionLocation, 3, gl.FLOAT, false, 0, 0)
		gl.uniformMatrix4fv(this.edgeResources.mvpLocation, false, mvp)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer)
		gl.drawElements(gl.LINES, geometry.edgeIndices.length, gl.UNSIGNED_SHORT, 0)
	}

	private drawFaces(cullMode: number): void {
		const gl = this.gl

		gl.cullFace(cullMode)
		const faceResources = this.faceResources
		for (const faceData of this.faceRenderData) {
			gl.uniform3fv(faceResources.normalLocation, new Float32Array(faceData.normal))
			gl.uniform4fv(faceResources.colorLocation, new Float32Array(faceData.color))
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

		const faceResources = this.faceResources

		gl.useProgram(faceResources.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.enableVertexAttribArray(faceResources.positionLocation)
		gl.vertexAttribPointer(faceResources.positionLocation, 3, gl.FLOAT, false, 0, 0)
		gl.uniformMatrix4fv(faceResources.mvpLocation, false, mvp)
		gl.uniform3fv(faceResources.lightDirectionLocation, new Float32Array(this.scene.lightDirection))

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
		this.drawEdges(mvp)
		this.drawTransparentFaces(mvp)
	}
}

export {
	FigureRenderer,
}
