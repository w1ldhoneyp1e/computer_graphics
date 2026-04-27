import {resizeCanvasToDisplaySize} from './canvas'
import {type FirstPersonCamera} from './FirstPersonCamera'
import {createMvpMatrix} from './math'
import {MazeScene} from './MazeScene'
import {FACE_FRAGMENT_SHADER, FACE_VERTEX_SHADER} from './shaders'
import {type FigureScene, type Vec3} from './types'
import {
	createBuffer,
	createProgram,
	requireAttribLocation,
	requireUniformLocation,
} from './webgl'

type FaceRenderData = {
	vertexBuffer: WebGLBuffer,
	indexBuffer: WebGLBuffer,
	indexCount: number,
	normal: Vec3,
	texCoordBuffer: WebGLBuffer,
	textureId: number,
}

type FaceResources = {
	program: WebGLProgram,
	positionLocation: number,
	texCoordLocation: number,
	mvpLocation: WebGLUniformLocation,
	normalLocation: WebGLUniformLocation,
	lightPositionLocation: WebGLUniformLocation,
	textureLocation: WebGLUniformLocation,
}

type FigureRendererDeps = {
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	scene: FigureScene,
}

class FigureRenderer {
	private static readonly WALL_TEXTURE_PATHS = [
		'/wall1.jpeg',
		'/wall2.jpeg',
		'/wall3.jpeg',
		'/wall4.jpeg',
		'/wall5.jpeg',
		'/wall6.jpeg',
	] as const

	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly faceRenderData: FaceRenderData[]
	private readonly faceResources: FaceResources
	private readonly textures: WebGLTexture[]

	private constructor({
		canvas,
		gl,
		scene,
		textures,
	}: FigureRendererDepsWithTextures) {
		this.canvas = canvas
		this.gl = gl
		this.textures = textures

		this.faceRenderData = scene.geometry.faces.map(face => ({
			vertexBuffer: createBuffer(this.gl, this.gl.ARRAY_BUFFER, face.vertices),
			indexBuffer: createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, face.indices),
			indexCount: face.indices.length,
			normal: face.normal,
			texCoordBuffer: createBuffer(this.gl, this.gl.ARRAY_BUFFER, face.texCoords),
			textureId: face.textureId,
		}))

		const faceProgram = createProgram(this.gl, FACE_VERTEX_SHADER, FACE_FRAGMENT_SHADER)

		this.faceResources = {
			program: faceProgram,
			positionLocation: requireAttribLocation(this.gl, faceProgram, 'a_position'),
			texCoordLocation: requireAttribLocation(this.gl, faceProgram, 'a_texCoord'),
			mvpLocation: requireUniformLocation(this.gl, faceProgram, 'u_mvp'),
			normalLocation: requireUniformLocation(this.gl, faceProgram, 'u_normal'),
			lightPositionLocation: requireUniformLocation(this.gl, faceProgram, 'u_lightPosition'),
			textureLocation: requireUniformLocation(this.gl, faceProgram, 'u_texture'),
		}

		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.clearColor(0.80, 0.80, 0.80, 1)
	}

	static async create({
		canvas,
		gl,
		scene,
	}: FigureRendererDeps): Promise<FigureRenderer> {
		const textures = await Promise.all(FigureRenderer.WALL_TEXTURE_PATHS.map(path => loadTexture(gl, path)))

		if (textures.length <= MazeScene.CEILING_TEXTURE_ID) {
			throw new Error('Недостаточно текстур для сцены')
		}

		return new FigureRenderer({
			canvas,
			gl,
			scene,
			textures,
		})
	}

	private drawFacesPass(mvp: Float32Array, lightPosition: Vec3): void {
		const gl = this.gl
		gl.depthMask(true)
		gl.disable(gl.BLEND)
		gl.disable(gl.CULL_FACE)

		const faceResources = this.faceResources

		gl.useProgram(faceResources.program)
		gl.enableVertexAttribArray(faceResources.positionLocation)
		gl.enableVertexAttribArray(faceResources.texCoordLocation)
		gl.uniformMatrix4fv(faceResources.mvpLocation, false, mvp)
		gl.uniform3fv(faceResources.lightPositionLocation, new Float32Array(lightPosition))
		gl.uniform1i(faceResources.textureLocation, 0)
		for (const faceData of this.faceRenderData) {
			gl.bindBuffer(gl.ARRAY_BUFFER, faceData.vertexBuffer)
			gl.vertexAttribPointer(faceResources.positionLocation, 3, gl.FLOAT, false, 0, 0)
			gl.bindBuffer(gl.ARRAY_BUFFER, faceData.texCoordBuffer)
			gl.vertexAttribPointer(faceResources.texCoordLocation, 2, gl.FLOAT, false, 0, 0)
			gl.uniform3fv(faceResources.normalLocation, new Float32Array(faceData.normal))
			gl.activeTexture(gl.TEXTURE0)
			gl.bindTexture(gl.TEXTURE_2D, this.textures[faceData.textureId] ?? null)
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceData.indexBuffer)
			gl.drawElements(gl.TRIANGLES, faceData.indexCount, gl.UNSIGNED_SHORT, 0)
		}
	}

	renderFrame(camera: FirstPersonCamera): void {
		resizeCanvasToDisplaySize(this.canvas)

		const gl = this.gl
		gl.viewport(0, 0, this.canvas.width, this.canvas.height)

		const aspectRatio = this.canvas.width / this.canvas.height
		camera.update()
		const cameraPosition = camera.getPosition()
		const cameraTarget = camera.getTarget()
		const mvp = createMvpMatrix(aspectRatio, cameraPosition, cameraTarget)

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		this.drawFacesPass(mvp, cameraPosition)
	}
}

type FigureRendererDepsWithTextures = FigureRendererDeps & {
	textures: WebGLTexture[],
}

async function loadTexture(gl: WebGLRenderingContext, url: string): Promise<WebGLTexture> {
	const image = new Image()
	image.src = url
	await image.decode()

	const texture = gl.createTexture()
	if (!texture) {
		throw new Error(`Не удалось создать текстуру ${url}`)
	}

	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	configureTexture(gl)

	return texture
}

function configureTexture(gl: WebGLRenderingContext): void {
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.generateMipmap(gl.TEXTURE_2D)
}

export {
	FigureRenderer,
}
