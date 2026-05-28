import {
	getCanvas,
	getFilterToggle,
	getGl,
	getImageInput,
} from './canvas'
import {loadImageFromFile} from './image'
import {MedianFilterRenderer} from './MedianFilterRenderer'

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const renderer = new MedianFilterRenderer(canvas, gl)
	const imageInput = getImageInput()
	const filterToggle = getFilterToggle()

	filterToggle.addEventListener('change', () => {
		renderer.setFilterEnabled(filterToggle.checked)
	})

	imageInput.addEventListener('change', () => {
		const file = imageInput.files?.[0]
		if (!file) {
			return
		}

		loadImageFromFile(file).then(image => {
			renderer.setImage(image, image.naturalWidth, image.naturalHeight)
		})
	})

	window.addEventListener('resize', () => {
		renderer.render()
	})
}

main()
