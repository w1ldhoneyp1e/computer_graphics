import {
	getCanvas,
	getFilterToggle,
	getGl,
	getImageInput,
	getRadiusDecButton,
	getRadiusIncButton,
	getRadiusInfo,
} from './canvas'
import {loadImageFromFile} from './image'
import {MedianFilterRenderer} from './MedianFilterRenderer'

function updateRadiusInfo(radiusInfo: HTMLElement, radius: number): void {
	const size = radius * 2 + 1
	radiusInfo.textContent = `Радиус: ${radius}, окно: ${size}x${size}`
}

function updateRadiusControls(
	radiusInfo: HTMLElement,
	radiusDecButton: HTMLButtonElement,
	radiusIncButton: HTMLButtonElement,
	radius: number,
): void {
	updateRadiusInfo(radiusInfo, radius)
	radiusDecButton.disabled = radius <= 1
	radiusIncButton.disabled = radius >= 7
}

function main(): void {
	const canvas = getCanvas()
	const gl = getGl(canvas)
	const renderer = new MedianFilterRenderer(canvas, gl)
	const imageInput = getImageInput()
	const filterToggle = getFilterToggle()
	const radiusInfo = getRadiusInfo()
	const radiusDecButton = getRadiusDecButton()
	const radiusIncButton = getRadiusIncButton()

	updateRadiusControls(radiusInfo, radiusDecButton, radiusIncButton, renderer.getFilterRadius())
	renderer.render()

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

	function changeRadius(direction: number): void {
		renderer.setFilterRadius(renderer.getFilterRadius() + direction)
		filterToggle.checked = true
		renderer.setFilterEnabled(true)
		updateRadiusControls(radiusInfo, radiusDecButton, radiusIncButton, renderer.getFilterRadius())
	}

	radiusDecButton.addEventListener('click', () => {
		changeRadius(-1)
	})

	radiusIncButton.addEventListener('click', () => {
		changeRadius(1)
	})

	window.addEventListener('resize', () => {
		renderer.render()
	})
}

main()
