import {colord} from 'colord'
import {BULLET_VERTICES, SHIP_FLAME_VERTICES} from '../Shared/constants'
import {
	type Asteroid,
	type Bullet,
	type Point,
	type Polygon,
	type Ship,
} from '../Shared/types'
import {worldVertices} from '../Shared/utils'

type DrawPolygonArgs = {
	polygon: Polygon,
	color: string,
}

const VS = `#version 100
attribute vec2 a_position;
uniform vec2 u_resolution;
void main() {
  vec2 pos = a_position / u_resolution * 2.0 - 1.0;
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

	private getGeometry(vertices: Point[]): Float32Array {
		const data = new Float32Array(vertices.length * 2)
		for (let i = 0; i < vertices.length; i++) {
			const v = vertices[i]
			if (!v) {
				continue
			}
			data[i * 2] = v.x
			data[i * 2 + 1] = v.y
		}

		return data
	}

	private drawPolygon({
		polygon,
		color,
	}: DrawPolygonArgs): void {
		const gl = this.gl
		const world = worldVertices(polygon)
		const withCenter = this.polygonWithCenter(world)
		const data = this.getGeometry(withCenter)
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
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
		gl.vertexAttribPointer(this.positionLoc, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, withCenter.length)
	}

	drawShip(ship: Ship): void {
		this.drawPolygon({
			polygon: ship,
			color: 'rgb(97 108 124)',
		})

		if (ship.thrust) {
			this.drawPolygon({
				polygon: {
					position: {
						x: ship.position.x,
						y: ship.position.y,
					},
					vertices: SHIP_FLAME_VERTICES,
					angle: ship.angle,
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
		for (const b of bullets) {
			this.drawPolygon({
				polygon: {
					position: b.position,
					vertices: BULLET_VERTICES,
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
