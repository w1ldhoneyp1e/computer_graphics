import {draw as drawFlower} from './flower'
import {draw as drawTriangle} from './triangle'
import {type Drawable} from './types'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) {
	throw new Error('2d context not available')
}
const context = ctx

let scene: Drawable[] = [
	// {
	// 	type: 'flower',
	// 	center: {
	// 		x: 200,
	// 		y: 200,
	// 	},
	// 	petalsAmount: 10,
	// 	petalColor: '#ff0000',
	// 	innerPetals: {
	// 		color: '#FF4F4FEE',
	// 		angleOffset: Math.PI / 12,
	// 	},
	// 	draw: drawFlower,
	// },
]

function renderScene(renderingContext: CanvasRenderingContext2D, sceneToRender: Drawable[]) {
	for (const drawableObj of sceneToRender) {
		switch (drawableObj.type) {
			case 'flower':
				drawableObj.draw(renderingContext, drawableObj)
				break
			case 'letter':
				drawableObj.draw(renderingContext, drawableObj)
				break
			case 'triangle':
				drawableObj.draw(renderingContext, drawableObj)
				break
		}
	}
}

function repaint() {
	context.clearRect(0, 0, canvas.width, canvas.height)
	renderScene(context, scene)
}

const form = document.getElementById('triangle-form') as HTMLFormElement
form.addEventListener('submit', e => {
	e.preventDefault()
	const data = new FormData(form)
	scene = [
		...scene,
		{
			type: 'triangle',
			v0: {
				x: Number(data.get('v0x')),
				y: Number(data.get('v0y')),
			},
			v1: {
				x: Number(data.get('v1x')),
				y: Number(data.get('v1y')),
			},
			v2: {
				x: Number(data.get('v2x')),
				y: Number(data.get('v2y')),
			},
			fillColor: String(data.get('fillColor')),
			draw: drawTriangle,
		},
	]
	repaint()
})

repaint()
