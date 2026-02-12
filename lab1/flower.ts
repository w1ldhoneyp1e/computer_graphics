import {type Point} from './types'

const PETAL_RADIUS = 20
const PETAL_LENGTH = 60
const PETAL_COLOR = '#ff0000' // red

const STALK_HEIGHT = 100
const STALK_WIDTH = 10
const STALK_COLOR = '#009000' // green

const CENTER_RADIUS = 50
const CENTER_COLOR = '#ffff00' // yellow

type DrawPetalsParams = {
	ctx: CanvasRenderingContext2D,
	amount: number,
	center: Point,
	color?: string,
	angleOffset?: number,
}

function drawPetals({
	ctx,
	amount,
	center,
	color = PETAL_COLOR,
	angleOffset = 0,
}: DrawPetalsParams) {
	for (let i = 0; i < amount; i++) {
		const angle = i * 2 * Math.PI / amount
		drawPetal({
			ctx,
			angle: angle + angleOffset,
			center,
			color,
		})
	}
}


type DrawPetalParams = {
	ctx: CanvasRenderingContext2D,
	angle: number,
	center: Point,
	color: string,
}
function drawPetal({
	ctx,
	angle,
	center,
	color,
}: DrawPetalParams) {
	const petalRadius = CENTER_RADIUS + PETAL_LENGTH * 0.4
	const x = center.x + petalRadius * Math.cos(angle)
	const y = center.y + petalRadius * Math.sin(angle)

	ctx.beginPath()
	ctx.ellipse(x, y, PETAL_LENGTH / 2, PETAL_RADIUS, angle, 0, 2 * Math.PI)
	ctx.fillStyle = color
	ctx.fill()
	ctx.strokeStyle = color
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
