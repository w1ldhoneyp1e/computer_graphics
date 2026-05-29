type CompatibleBufferSource = ArrayBufferLike | ArrayBufferView

function createBuffer(gl: WebGLRenderingContext, target: number, data: CompatibleBufferSource): WebGLBuffer {
	const buffer = gl.createBuffer()
	if (!buffer) {
		throw new Error('Не удалось создать буфер WebGL')
	}

	gl.bindBuffer(target, buffer)
	gl.bufferData(target, data as unknown as BufferSource, gl.STATIC_DRAW)

	return buffer
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)
	if (!shader) {
		throw new Error('Не удалось создать шейдер')
	}

	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader) ?? 'unknown shader compile error'
		gl.deleteShader(shader)

		throw new Error(info)
	}

	return shader
}

function createProgram(
	gl: WebGLRenderingContext,
	vertexShaderSource: string,
	fragmentShaderSource: string,
): WebGLProgram {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
	const program = gl.createProgram()
	if (!program) {
		throw new Error('Не удалось создать программу WebGL')
	}

	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program) ?? 'unknown program link error'
		gl.deleteProgram(program)

		throw new Error(info)
	}

	gl.deleteShader(vertexShader)
	gl.deleteShader(fragmentShader)

	return program
}

function requireAttribLocation(gl: WebGLRenderingContext, program: WebGLProgram, name: string): number {
	const location = gl.getAttribLocation(program, name)
	if (location < 0) {
		throw new Error(`Атрибут ${name} не найден`)
	}

	return location
}

function requireUniformLocation(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	name: string,
): WebGLUniformLocation {
	const location = gl.getUniformLocation(program, name)
	if (!location) {
		throw new Error(`Юниформ ${name} не найден`)
	}

	return location
}

function createTexture(gl: WebGLRenderingContext): WebGLTexture {
	const texture = gl.createTexture()
	if (!texture) {
		throw new Error('Не удалось создать текстуру')
	}

	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

	return texture
}

export {
	createBuffer,
	createProgram,
	createTexture,
	requireAttribLocation,
	requireUniformLocation,
}
