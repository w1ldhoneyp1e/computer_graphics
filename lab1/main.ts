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

drawStalk(ctx)
drawPetals(ctx, 10, {
	x: 400,
	y: 400,
})
drawCenter(ctx)
