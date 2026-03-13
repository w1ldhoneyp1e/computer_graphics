import {colord} from 'colord'
import {worldVertices} from '../Shared/Collision'
import {
	type Asteroid,
	type Bullet,
	type Point,
	type Polygon,
	type Ship,
} from '../Shared/types'

type DrawPolygonArgs = {
	polygon: Polygon,
	color: string,
}

const VS = `#version 100
attribute Point a_position;
uniform Point u_resolution;
void main() {
  Point pos = a_position / u_resolution * 2.0 - 1.0;
  pos.y = -pos.y;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`

const FS = `#version 100
precision mediump float;
uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type)
	if (!shader) {
		return null
	}
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader)
		return null
	}
	return shader
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
	const program = gl.createProgram()
	if (!program) {
		return null
	}
	gl.attachShader(program, vs)
	gl.attachShader(program, fs)
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program)
		return null
	}
	return program
}

class GameRenderer {
	private readonly gl: WebGLRenderingContext
	private readonly program: WebGLProgram
	private readonly positionLoc: number
	private readonly resolutionLoc: WebGLUniformLocation | null
	private readonly colorLoc: WebGLUniformLocation | null
	private readonly buffer: WebGLBuffer | null
	private resolution: [number, number]

	constructor(gl: WebGLRenderingContext, width: number, height: number) {
		this.gl = gl
		this.resolution = [width, height]

		const vs = compileShader(gl, gl.VERTEX_SHADER, VS)
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS)
		if (!vs || !fs) {
			throw new Error('Shader compile failed')
		}
		const program = createProgram(gl, vs, fs)
		if (!program) {
			throw new Error('Program link failed')
		}
		this.program = program
		this.positionLoc = gl.getAttribLocation(program, 'a_position')
		this.resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
		this.colorLoc = gl.getUniformLocation(program, 'u_color')
		this.buffer = gl.createBuffer()
	}

	private polygonWithCenter(vertices: Point[]): Point[] {
		let cx = 0
		let cy = 0
		for (const v of vertices) {
			cx += v.x
			cy += v.y
		}
		const n = vertices.length
		const center: Point = {
			x: cx / n,
			y: cy / n,
		}

		return [center, ...vertices]
	}

	private setGeometry(vertices: Point[]): void {
		const gl = this.gl
		const data = new Float32Array(vertices.length * 2)
		for (let i = 0; i < vertices.length; i++) {
			const v = vertices[i]
			if (!v) {
				continue
			}
			data[i * 2] = v.x
			data[i * 2 + 1] = v.y
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
	}

	private drawPolygon({
		polygon,
		color,
	}: DrawPolygonArgs): void {
		const gl = this.gl
		const world = worldVertices(polygon)
		const withCenter = this.polygonWithCenter(world)
		this.setGeometry(withCenter)
		const rgba = colord(color).toRgb()
		gl.useProgram(this.program)
		gl.uniform2f(this.resolutionLoc, this.resolution[0], this.resolution[1])
		gl.uniform4f(
			this.colorLoc,
			rgba.r / 255,
			rgba.g / 255,
			rgba.b / 255,
			rgba.a,
		)
		gl.enableVertexAttribArray(this.positionLoc)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
		gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, withCenter.length)
	}

	drawShip(ship: Ship): void {
		this.drawPolygon({
			polygon: ship,
			color: 'rgb(102, 204, 102)',
		})
		if (ship.thrust) {
			const tail: Point[] = [
				{
					x: -8,
					y: 4,
				},
				{
					x: -14,
					y: 0,
				},
				{
					x: -8,
					y: -4,
				},
			]
			this.drawPolygon({
				polygon: {
					...ship,
					vertices: tail,
				},
				color: 'rgb(255, 128, 26)',
			})
		}
	}

	drawAsteroid(asteroid: Asteroid): void {
		this.drawPolygon({
			polygon: asteroid,
			color: 'rgb(153, 128, 102)',
		})
	}

	drawBullets(bullets: Bullet[]): void {
		const verts: Point[] = [
			{
				x: -2,
				y: -2,
			},
			{
				x: 2,
				y: -2,
			},
			{
				x: 0,
				y: 2,
			},
		]
		for (const b of bullets) {
			this.drawPolygon({
				polygon: {
					position: b.position,
					vertices: verts,
					angle: 0,
				},
				color: 'rgb(255, 255, 204)',
			})
		}
	}

	resize(w: number, h: number): void {
		this.resolution = [w, h]
	}
}

export {
	GameRenderer,
}
