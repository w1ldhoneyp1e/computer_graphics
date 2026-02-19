import {draw} from 'flower'
import {type Drawable} from 'types'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) {
	throw new Error('2d context not available')
}

const SCENE: Drawable[] = [
	{
		type: 'flower',
		center: {
			x: 200,
			y: 200,
		},
		petalsAmount: 10,
		petalColor: '#ff0000',
		innerPetals: {
			color: '#FF4F4FEE',
			angleOffset: Math.PI / 12,
		},
		draw,
	},
]

function renderScene(context: CanvasRenderingContext2D, scene: Drawable[]) {
	for (const drawableObj of scene) {
		switch (drawableObj.type) {
			case 'flower':
				drawableObj.draw(context, drawableObj)
				break
			case 'letter':
				drawableObj.draw(context, drawableObj)
				break
		}
	}
}

renderScene(ctx, SCENE)
