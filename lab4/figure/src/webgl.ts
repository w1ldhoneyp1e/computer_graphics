type CompatibleBufferSource = ArrayBufferLike | ArrayBufferView

function createBuffer(gl: WebGLRenderingContext, target: number, data: CompatibleBufferSource): WebGLBuffer {
	const buffer = gl.createBuffer()
	if (!buffer) {
		throw new Error('Не удалось создать буфер WebGL')
	}

	const uploadData = data as unknown as BufferSource
	gl.bindBuffer(target, buffer)
	gl.bufferData(target, uploadData, gl.STATIC_DRAW)

	return buffer
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
	const isLinked = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (!isLinked) {
		const info = gl.getProgramInfoLog(program) ?? 'unknown program link error'

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

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type)
	if (!shader) {
		throw new Error('Не удалось создать шейдер')
	}

	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	if (!isCompiled) {
		const info = gl.getShaderInfoLog(shader) ?? 'unknown shader compile error'

		throw new Error(info)
	}

	return shader
}

export {
	createBuffer,
	createProgram,
	requireAttribLocation,
	requireUniformLocation,
}
