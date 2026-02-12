import {
	drawCenter,
	drawPetals,
	drawStalk,
} from './flower'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) {
	throw new Error('2d context not available')
}


const center = {
	x: 400,
	y: 400,
}
const petalsAmount = 10

drawStalk(ctx, center)
drawCenter(ctx, center)
drawPetals({
	ctx,
	amount: petalsAmount,
	center,
	color: '#ff0000',
})
drawPetals({
	ctx,
	amount: petalsAmount,
	center,
	color: '#FF4F4FEE',
	angleOffset: Math.PI / 12,
})
