import {resizeCanvasToDisplaySize} from './canvas'
import {createMvpMatrix} from './math'
import {type OrbitCamera} from './OrbitCamera'
import {
	SURFACE_FRAGMENT_SHADER,
	SURFACE_VERTEX_SHADER,
	WIREFRAME_FRAGMENT_SHADER,
} from './shaders'
import {type SurfaceGrid} from './types'
import {
	createBuffer,
	createProgram,
	requireAttribLocation,
	requireUniformLocation,
} from './webgl'

type ProgramResources = {
	program: WebGLProgram,
	positionLocation: number,
	mvpLocation: WebGLUniformLocation,
	morphLocation: WebGLUniformLocation,
	lightDirectionLocation?: WebGLUniformLocation,
}

type TransformationRendererDeps = {
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	grid: SurfaceGrid,
}

class TransformationRenderer {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly grid: SurfaceGrid
	private readonly vertexBuffer: WebGLBuffer
	private readonly lineIndexBuffer: WebGLBuffer
	private readonly triangleIndexBuffer: WebGLBuffer
	private readonly surface: ProgramResources
	private readonly wireframe: ProgramResources
	private readonly startedAt = performance.now()

	constructor({
		canvas,
		gl,
		grid,
	}: TransformationRendererDeps) {
		this.canvas = canvas
		this.gl = gl
		this.grid = grid
		this.vertexBuffer = createBuffer(gl, gl.ARRAY_BUFFER, grid.vertices)
		this.lineIndexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, grid.lineIndices)
		this.triangleIndexBuffer = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, grid.triangleIndices)
		this.surface = this.createSurfaceProgram()
		this.wireframe = this.createWireframeProgram()

		gl.enable(gl.DEPTH_TEST)
		gl.clearColor(0.07, 0.08, 0.10, 1)
	}

	renderFrame(camera: OrbitCamera): void {
		resizeCanvasToDisplaySize(this.canvas)

		const gl = this.gl
		const aspectRatio = this.canvas.width / this.canvas.height
		const mvp = createMvpMatrix(aspectRatio, camera.getPosition())
		const morph = this.calcMorph()

		gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		this.drawSurface(mvp, morph)
		this.drawWireframe(mvp, morph)
	}

	private calcMorph(): number {
		const seconds = (performance.now() - this.startedAt) / 1000

		return 0.5 + 0.5 * Math.sin(seconds * 0.72)
	}

	private createSurfaceProgram(): ProgramResources {
		const program = createProgram(this.gl, SURFACE_VERTEX_SHADER, SURFACE_FRAGMENT_SHADER)

		return {
			program,
			positionLocation: requireAttribLocation(this.gl, program, 'a_position'),
			mvpLocation: requireUniformLocation(this.gl, program, 'u_mvp'),
			morphLocation: requireUniformLocation(this.gl, program, 'u_morph'),
			lightDirectionLocation: requireUniformLocation(this.gl, program, 'u_lightDirection'),
		}
	}

	private createWireframeProgram(): ProgramResources {
		const program = createProgram(this.gl, SURFACE_VERTEX_SHADER, WIREFRAME_FRAGMENT_SHADER)

		return {
			program,
			positionLocation: requireAttribLocation(this.gl, program, 'a_position'),
			mvpLocation: requireUniformLocation(this.gl, program, 'u_mvp'),
			morphLocation: requireUniformLocation(this.gl, program, 'u_morph'),
		}
	}

	private bindPosition(program: ProgramResources): void {
		const gl = this.gl

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.enableVertexAttribArray(program.positionLocation)
		gl.vertexAttribPointer(program.positionLocation, 3, gl.FLOAT, false, 0, 0)
	}

	private drawSurface(mvp: Float32Array, morph: number): void {
		const gl = this.gl

		gl.enable(gl.POLYGON_OFFSET_FILL)
		gl.polygonOffset(1, 1)
		gl.useProgram(this.surface.program)
		this.bindPosition(this.surface)
		gl.uniformMatrix4fv(this.surface.mvpLocation, false, mvp)
		gl.uniform1f(this.surface.morphLocation, morph)
		gl.uniform3f(this.surface.lightDirectionLocation!, -3.2, -5.0, -4.0)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer)
		gl.drawElements(gl.TRIANGLES, this.grid.triangleIndices.length, gl.UNSIGNED_SHORT, 0)
		gl.disable(gl.POLYGON_OFFSET_FILL)
	}

	private drawWireframe(mvp: Float32Array, morph: number): void {
		const gl = this.gl

		gl.useProgram(this.wireframe.program)
		this.bindPosition(this.wireframe)
		gl.uniformMatrix4fv(this.wireframe.mvpLocation, false, mvp)
		gl.uniform1f(this.wireframe.morphLocation, morph)
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer)
		gl.drawElements(gl.LINES, this.grid.lineIndices.length, gl.UNSIGNED_SHORT, 0)
	}
}

export {
	TransformationRenderer,
}
