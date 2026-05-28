function getCanvas(): HTMLCanvasElement {
	const canvas = document.getElementById('app')
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas не найден')
	}

	return canvas
}

function getImageInput(): HTMLInputElement {
	const input = document.getElementById('imageInput')
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('Поле загрузки изображения не найдено')
	}

	return input
}

function getFilterToggle(): HTMLInputElement {
	const input = document.getElementById('filterToggle')
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('Переключатель фильтра не найден')
	}

	return input
}

function getGl(canvas: HTMLCanvasElement): WebGLRenderingContext {
	const gl = canvas.getContext('webgl', {
		alpha: false,
		antialias: false,
		preserveDrawingBuffer: true,
	})
	if (!gl) {
		throw new Error('WebGL не поддерживается')
	}

	return gl
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
	const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
	const width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
	const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))
	if (canvas.width === width && canvas.height === height) {
		return
	}

	canvas.width = width
	canvas.height = height
}

export {
	getCanvas,
	getFilterToggle,
	getGl,
	getImageInput,
	resizeCanvasToDisplaySize,
}
