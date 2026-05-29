import {resizeCanvasToDisplaySize} from './canvas'
import {
	COPY_FRAGMENT_SHADER,
	FULLSCREEN_VERTEX_SHADER,
	MEDIAN_FRAGMENT_SHADER,
} from './shaders'
import {
	createBuffer,
	createProgram,
	createTexture,
	requireAttribLocation,
	requireUniformLocation,
} from './webgl'

type ImageSource = HTMLImageElement

type ProgramResources = {
	program: WebGLProgram,
	positionLocation: number,
	texCoordLocation: number,
	imageLocation: WebGLUniformLocation,
	radiusLocation?: WebGLUniformLocation,
	texelSizeLocation?: WebGLUniformLocation,
}

class MedianFilterRenderer {
	private readonly canvas: HTMLCanvasElement
	private readonly gl: WebGLRenderingContext
	private readonly filterPositionBuffer: WebGLBuffer
	private readonly screenPositionBuffer: WebGLBuffer
	private readonly texCoordBuffer: WebGLBuffer
	private readonly copyResources: ProgramResources
	private readonly medianResources: ProgramResources
	private readonly sourceTexture: WebGLTexture
	private readonly filteredTexture: WebGLTexture
	private readonly frameBuffer: WebGLFramebuffer
	private imageWidth = 1
	private imageHeight = 1
	private filterRadius = 1
	private filterEnabled = true
	private hasImage = false

	constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		this.canvas = canvas
		this.gl = gl
		this.filterPositionBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			1, -1,
			-1, 1,
			-1, 1,
			1, -1,
			1, 1,
		]))
		this.screenPositionBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
			-1, -1,
			1, -1,
			-1, 1,
			-1, 1,
			1, -1,
			1, 1,
		]))
		this.texCoordBuffer = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
			0, 0,
			1, 0,
			0, 1,
			0, 1,
			1, 0,
			1, 1,
		]))

		const copyProgram = createProgram(gl, FULLSCREEN_VERTEX_SHADER, COPY_FRAGMENT_SHADER)
		this.copyResources = this.createProgramResources(copyProgram)
		this.medianResources = this.createMedianResources()
		this.sourceTexture = createTexture(gl)
		this.filteredTexture = createTexture(gl)

		const frameBuffer = gl.createFramebuffer()
		if (!frameBuffer) {
			throw new Error('Не удалось создать буфер кадра')
		}
		this.frameBuffer = frameBuffer

		gl.clearColor(1, 1, 1, 1)
	}

	setFilterEnabled(enabled: boolean): void {
		this.filterEnabled = enabled
		this.render()
	}

	getFilterRadius(): number {
		return this.filterRadius
	}

	setFilterRadius(radius: number): void {
		const nextRadius = Math.max(1, Math.min(7, Math.round(radius)))
		if (nextRadius === this.filterRadius) {
			return
		}

		this.filterRadius = nextRadius
		this.render()
	}

	setImage(source: ImageSource, width: number, height: number): void {
		const gl = this.gl
		resizeCanvasToDisplaySize(this.canvas)

		const fittedImage = this.createFittedImage(source, width, height)
		this.imageWidth = fittedImage.width
		this.imageHeight = fittedImage.height
		this.hasImage = true

		gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fittedImage)

		gl.bindTexture(gl.TEXTURE_2D, this.filteredTexture)
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			this.imageWidth,
			this.imageHeight,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null,
		)

		this.render()
	}

	render(): void {
		resizeCanvasToDisplaySize(this.canvas)

		const gl = this.gl
		if (!this.hasImage) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null)
			gl.viewport(0, 0, this.canvas.width, this.canvas.height)
			gl.clear(gl.COLOR_BUFFER_BIT)

			return
		}

		if (this.filterEnabled) {
			this.renderMedianPass()
			this.renderToScreen(this.filteredTexture)
		}
		else {
			this.renderToScreen(this.sourceTexture)
		}
	}

	private createFittedImage(source: ImageSource, width: number, height: number): HTMLCanvasElement {
		const maxCanvasSide = Math.max(this.canvas.width, this.canvas.height, 1)
		const maxImageSide = Math.max(width, height, 1)
		const scale = Math.min(1, maxCanvasSide / maxImageSide)
		const fittedWidth = Math.max(1, Math.floor(width * scale))
		const fittedHeight = Math.max(1, Math.floor(height * scale))
		const fittedImage = document.createElement('canvas')
		fittedImage.width = fittedWidth
		fittedImage.height = fittedHeight

		const context = fittedImage.getContext('2d')
		if (!context) {
			throw new Error('Не удалось подготовить изображение')
		}
		context.drawImage(source, 0, 0, fittedWidth, fittedHeight)

		return fittedImage
	}

	private createProgramResources(
		program: WebGLProgram,
		needsTexelSize = false,
		needsRadius = false,
	): ProgramResources {
		const gl = this.gl
		const resources: ProgramResources = {
			program,
			positionLocation: requireAttribLocation(gl, program, 'a_position'),
			texCoordLocation: requireAttribLocation(gl, program, 'a_texCoord'),
			imageLocation: requireUniformLocation(gl, program, 'u_image'),
		}

		if (needsTexelSize) {
			resources.texelSizeLocation = requireUniformLocation(gl, program, 'u_texelSize')
		}
		if (needsRadius) {
			resources.radiusLocation = requireUniformLocation(gl, program, 'u_radius')
		}

		return resources
	}

	private createMedianResources(): ProgramResources {
		const program = createProgram(this.gl, FULLSCREEN_VERTEX_SHADER, MEDIAN_FRAGMENT_SHADER)

		return this.createProgramResources(program, true, true)
	}

	private updateScreenQuadPositions(): void {
		const gl = this.gl
		const width = this.imageWidth / this.canvas.width
		const height = this.imageHeight / this.canvas.height

		gl.bindBuffer(gl.ARRAY_BUFFER, this.screenPositionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-width, -height,
			width, -height,
			-width, height,
			-width, height,
			width, -height,
			width, height,
		]), gl.DYNAMIC_DRAW)
	}

	private bindQuad(resources: ProgramResources, positionBuffer: WebGLBuffer): void {
		const gl = this.gl

		gl.useProgram(resources.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
		gl.enableVertexAttribArray(resources.positionLocation)
		gl.vertexAttribPointer(resources.positionLocation, 2, gl.FLOAT, false, 0, 0)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
		gl.enableVertexAttribArray(resources.texCoordLocation)
		gl.vertexAttribPointer(resources.texCoordLocation, 2, gl.FLOAT, false, 0, 0)

		gl.activeTexture(gl.TEXTURE0)
		gl.uniform1i(resources.imageLocation, 0)
	}

	private renderMedianPass(): void {
		const gl = this.gl
		const radiusLocation = this.medianResources.radiusLocation
		const texelSizeLocation = this.medianResources.texelSizeLocation
		if (!radiusLocation || !texelSizeLocation) {
			throw new Error('Юниформ u_texelSize не найден')
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			this.filteredTexture,
			0,
		)

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			throw new Error('Буфер кадра WebGL не завершен')
		}

		gl.viewport(0, 0, this.imageWidth, this.imageHeight)
		gl.clear(gl.COLOR_BUFFER_BIT)
		this.bindQuad(this.medianResources, this.filterPositionBuffer)
		gl.uniform1i(radiusLocation, this.filterRadius)
		gl.uniform2f(texelSizeLocation, 1 / this.imageWidth, 1 / this.imageHeight)
		gl.bindTexture(gl.TEXTURE_2D, this.sourceTexture)
		gl.drawArrays(gl.TRIANGLES, 0, 6)
	}

	private renderToScreen(texture: WebGLTexture): void {
		const gl = this.gl
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.viewport(0, 0, this.canvas.width, this.canvas.height)
		gl.clear(gl.COLOR_BUFFER_BIT)
		this.updateScreenQuadPositions()
		this.bindQuad(this.copyResources, this.screenPositionBuffer)
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.drawArrays(gl.TRIANGLES, 0, 6)
	}
}

export {
	MedianFilterRenderer,
}
