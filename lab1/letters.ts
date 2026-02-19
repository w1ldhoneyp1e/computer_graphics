import {type LetterProps} from './types'

const BLACK_COLOR = '#000000'
const WHITE_COLOR = '#ffffff'

const PI = Math.PI

const LETTER_ORIGIN: Record<LetterProps['letter'], {
	x: number,
	y: number,
}> = {
	Ya: {
		x: 175,
		y: 150,
	},
	K: {
		x: 262.5,
		y: 200,
	},
	R: {
		x: 425,
		y: 150,
	},
}

function drawYaLocal(ctx: CanvasRenderingContext2D) {
	ctx.beginPath()
	ctx.arc(0, 0, 50, -PI / 2, -PI * 3 / 2, true)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.arc(0, 0, 25, -PI / 2, -PI * 3 / 2, true)
	ctx.fillStyle = WHITE_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.rect(25, -50, -25, 200)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.moveTo(0, 25)
	ctx.lineTo(-75, 150)
	ctx.lineTo(-50, 150)
	ctx.lineTo(0, 300 - (125 / 75 * 50) - 150)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()
}

function drawKLocal(ctx: CanvasRenderingContext2D) {
	const yCenterOfK = 12.5

	ctx.beginPath()
	ctx.rect(-12.5, -100, 25, 200)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.moveTo(12.5, -25)
	ctx.lineTo(62.5, -100)
	ctx.lineTo(87.5, -100)
	ctx.lineTo(12.5, yCenterOfK)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.moveTo(12.5, yCenterOfK - 40)
	ctx.lineTo(87.5, 100)
	ctx.lineTo(62.5, 100)
	ctx.lineTo(12.5, 15)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()
}

function drawRLocal(ctx: CanvasRenderingContext2D) {
	ctx.beginPath()
	ctx.arc(0, 0, 50, -PI / 2, -PI * 3 / 2)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.arc(0, 0, 25, -PI / 2, -PI * 3 / 2)
	ctx.fillStyle = WHITE_COLOR
	ctx.fill()

	ctx.beginPath()
	ctx.rect(-25, -50, 25, 200)
	ctx.fillStyle = BLACK_COLOR
	ctx.fill()
}

const LOCAL_DRAW: Record<LetterProps['letter'], (ctx: CanvasRenderingContext2D) => void> = {
	Ya: drawYaLocal,
	K: drawKLocal,
	R: drawRLocal,
}

function draw(ctx: CanvasRenderingContext2D, props: LetterProps) {
	const origin = LETTER_ORIGIN[props.letter]

	ctx.save()
	ctx.translate(props.position.x - origin.x, props.position.y - origin.y)
	LOCAL_DRAW[props.letter](ctx)
	ctx.restore()
}

const letterDrawable = {
	draw,
} as const

export {
	letterDrawable,
	draw,
}
