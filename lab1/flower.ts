import {type Point} from './types'

const PETAL_RADIUS = 20
const PETAL_HEIGHT = 5
const PETAL_COLOR = '#ff0000' // red

const STALK_HEIGHT = 100
const STALK_WIDTH = 10
const STALK_COLOR = '#009000' // green

const CENTER_RADIUS = 50
const CENTER_COLOR = '#ffff00' // yellow

function drawPetals(ctx: CanvasRenderingContext2D, amount: number, center: Point) {
	for (let i = 0; i < amount; i++) {
		const angle = i * 2 * Math.PI / amount
		drawPetal(ctx, angle, center)
	}
}

function drawPetal(ctx: CanvasRenderingContext2D, angle: number, center: Point) {
	const x = center.x + CENTER_RADIUS * Math.cos(angle)
	const y = center.y + CENTER_RADIUS * Math.sin(angle)

	ctx.beginPath()
	ctx.ellipse(x, y, PETAL_RADIUS, PETAL_HEIGHT, angle, 0, 2 * Math.PI)
	ctx.fillStyle = PETAL_COLOR
	ctx.fill()
	ctx.strokeStyle = PETAL_COLOR
	ctx.stroke()
}

function drawStalk(ctx: CanvasRenderingContext2D, center: Point) {
	ctx.strokeStyle = STALK_COLOR
	ctx.beginPath()
	ctx.moveTo(center.x, center.y)
	ctx.lineTo(center.x, center.y + STALK_HEIGHT)
	ctx.lineTo(center.x + STALK_WIDTH, center.y + STALK_HEIGHT)
	ctx.lineTo(center.x + STALK_WIDTH, center.y)
	ctx.fillStyle = STALK_COLOR
	ctx.fill()
}

function drawCenter(ctx: CanvasRenderingContext2D, center: Point) {
	ctx.strokeStyle = CENTER_COLOR
	ctx.beginPath()
	ctx.arc(center.x, center.y, CENTER_RADIUS, 0, 2 * Math.PI)
	ctx.fillStyle = CENTER_COLOR
	ctx.fill()
}


export {
	drawPetals,
	drawPetal,
	drawStalk,
	drawCenter,
}
