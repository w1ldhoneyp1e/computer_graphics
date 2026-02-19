import {type FlowerProps, type Point} from './types'

const PETAL_RADIUS = 20
const PETAL_LENGTH = 60
const PETAL_COLOR = '#ff0000'

const STALK_HEIGHT = 220
const STALK_WIDTH = 16
const STALK_COLOR = '#009000'

const CENTER_RADIUS = 50
const CENTER_COLOR = '#ffff00'

const DEFAULT_PETALS_AMOUNT = 10

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

type PetalsOptions = {
	ctx: CanvasRenderingContext2D,
	amount: number,
	center: Point,
	color: string,
	angleOffset?: number,
}

function drawPetals({
	ctx,
	amount,
	center,
	color,
	angleOffset = 0,
}: PetalsOptions) {
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

function drawStalk(ctx: CanvasRenderingContext2D, center: Point) {
	const cpX = center.x + 100
	const cpY = center.y + STALK_HEIGHT / 2
	const endX = center.x + 8
	const endY = center.y + STALK_HEIGHT

	ctx.beginPath()
	ctx.moveTo(center.x, center.y)
	ctx.quadraticCurveTo(cpX, cpY, endX, endY)
	ctx.lineCap = 'round'
	ctx.lineJoin = 'round'
	ctx.lineWidth = STALK_WIDTH
	ctx.strokeStyle = STALK_COLOR
	ctx.stroke()
}

function drawCenter(ctx: CanvasRenderingContext2D, center: Point) {
	ctx.strokeStyle = CENTER_COLOR
	ctx.beginPath()
	ctx.arc(center.x, center.y, CENTER_RADIUS, 0, 2 * Math.PI)
	ctx.fillStyle = CENTER_COLOR
	ctx.fill()
}

function draw(ctx: CanvasRenderingContext2D, props: FlowerProps) {
	const amount = props.petalsAmount ?? DEFAULT_PETALS_AMOUNT
	const petalColor = props.petalColor ?? PETAL_COLOR

	drawStalk(ctx, props.center)
	drawCenter(ctx, props.center)
	drawPetals({
		ctx,
		amount,
		center: props.center,
		color: petalColor,
	})
	if (props.innerPetals) {
		drawPetals({
			ctx,
			amount,
			center: props.center,
			color: props.innerPetals.color ?? petalColor,
			angleOffset: props.innerPetals.angleOffset ?? Math.PI / 12,
		})
	}
}

const flowerDrawable = {
	draw,
} as const

export {
	flowerDrawable,
	draw,
}
