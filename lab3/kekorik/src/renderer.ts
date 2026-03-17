import {worldToNdc} from './math'
import type {Color, ViewBounds} from './types'

const vertexShaderSource = `
attribute vec2 a_position;
uniform vec4 u_color;
varying vec4 v_color;

void main() {
	gl_Position = vec4(a_position, 0.0, 1.0);
	v_color = u_color;
}
`

const fragmentShaderSource = `
precision mediump float;
varying vec4 v_color;

void main() {
	gl_FragColor = v_color;
}
`

class WebGlRenderer {
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private readonly vertexBuffer: WebGLBuffer
	private readonly positionLoc: number
	private readonly colorLoc: WebGLUniformLocation
	private viewBounds: ViewBounds

	constructor(gl: WebGLRenderingContext, initialViewBounds: ViewBounds) {
		this.gl = gl
		this.program = this.createProgram()
		const buffer = gl.createBuffer()
		if (!buffer) {
			throw new Error('Не удалось создать буфер вершин')
		}
		this.vertexBuffer = buffer
		const positionLoc = gl.getAttribLocation(this.program, 'a_position')
		const colorLoc = gl.getUniformLocation(this.program, 'u_color')
		if (positionLoc < 0 || !colorLoc) {
			throw new Error('Не удалось получить локации шейдера')
		}
		this.positionLoc = positionLoc
		this.colorLoc = colorLoc
		this.viewBounds = initialViewBounds
		this.initializeState()
	}

	setViewBounds(bounds: ViewBounds): void {
		this.viewBounds = bounds
	}

	setBackground(color: Color): void {
		this.gl.clearColor(color[0], color[1], color[2], color[3])
	}

	clear(): void {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
	}

	resize(width: number, height: number): void {
		this.gl.viewport(0, 0, width, height)
	}

	drawTriangles(verticesInWorld: Float32Array, color: Color): void {
		if (verticesInWorld.length === 0) {
			return
		}

		const verticesInNdc = new Float32Array(verticesInWorld.length)
		for (let i = 0; i < verticesInWorld.length; i += 2) {
			const wx = verticesInWorld[i]
			const wy = verticesInWorld[i + 1]
			if (wx === undefined || wy === undefined) {
				continue
			}
			const point = worldToNdc(wx, wy, this.viewBounds)
			verticesInNdc[i] = point[0]
			verticesInNdc[i + 1] = point[1]
		}

		const gl = this.gl
		gl.useProgram(this.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, verticesInNdc, gl.STATIC_DRAW)
		gl.enableVertexAttribArray(this.positionLoc)
		gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0)
		gl.uniform4fv(this.colorLoc, color)
		gl.drawArrays(gl.TRIANGLES, 0, verticesInNdc.length / 2)
	}

	private createProgram(): WebGLProgram {
		const gl = this.gl
		const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource)
		const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)
		const program = gl.createProgram()
		if (!program) {
			throw new Error('Не удалось создать WebGL программу')
		}
		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)
		gl.deleteShader(vertexShader)
		gl.deleteShader(fragmentShader)
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program)
			gl.deleteProgram(program)
			throw new Error(`Ошибка линковки программы: ${info ?? 'нет деталей'}`)
		}

		return program
	}

	private createShader(type: number, source: string): WebGLShader {
		const shader = this.gl.createShader(type)
		if (!shader) {
			throw new Error('Не удалось создать шейдер')
		}
		this.gl.shaderSource(shader, source)
		this.gl.compileShader(shader)
		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			const info = this.gl.getShaderInfoLog(shader)
			this.gl.deleteShader(shader)
			throw new Error(`Ошибка компиляции шейдера: ${info ?? 'нет деталей'}`)
		}

		return shader
	}

	private initializeState(): void {
		const gl = this.gl
		gl.disable(gl.DEPTH_TEST)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	}
}

export {WebGlRenderer}
