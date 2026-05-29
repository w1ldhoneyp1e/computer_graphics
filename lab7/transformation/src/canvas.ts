function getCanvas(): HTMLCanvasElement {
	const canvas = document.getElementById('app')
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas не найден')
	}

	return canvas
}

function getGl(canvas: HTMLCanvasElement): WebGLRenderingContext {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: true,
	})
	if (!gl) {
		throw new Error('WebGL не поддерживается')
	}

	return gl
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
	const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
	const width = Math.floor(canvas.clientWidth * dpr)
	const height = Math.floor(canvas.clientHeight * dpr)
	if (canvas.width === width && canvas.height === height) {
		return
	}

	canvas.width = width
	canvas.height = height
}

export {
	getCanvas,
	getGl,
	resizeCanvasToDisplaySize,
}
