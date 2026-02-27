type Point = {
	x: number,
	y: number,
}

const GALLOWS_COLOR = '#5d4e37'
const ROPE_COLOR = '#7C4B00'
const BODY_COLOR = '#665D40'
const HEAD_RADIUS = 15

class HangmanRenderer {
	private readonly parts: (() => void)[]

	constructor(
		private readonly ctx: CanvasRenderingContext2D,
		private readonly origin: Point,
	) {
		this.parts = [
			() => this.drawRope(),
			() => this.drawHead(),
			() => this.drawBody(),
			() => this.drawLeftArm(),
			() => this.drawRightArm(),
			() => this.drawLeftLeg(),
			() => this.drawRightLeg(),
		]
	}

	draw(wrongCount: number): void {
		this.drawGallows()
		for (let i = 0; i < wrongCount && i < this.parts.length; i++) {
			const drawPart = this.parts[i]
			if (drawPart) {
				drawPart()
			}
		}
	}

	private drawGallows(): void {
		const {x, y} = this.origin
		this.ctx.strokeStyle = GALLOWS_COLOR
		this.ctx.lineWidth = 6
		this.ctx.lineCap = 'round'

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x, y - 220)
		this.ctx.lineTo(x + 120, y - 220)
		this.ctx.lineTo(x + 120, y - 180)
		this.ctx.stroke()
	}

	private drawRope(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 180
		this.ctx.strokeStyle = ROPE_COLOR
		this.ctx.lineWidth = 4

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x, y + 25)
		this.ctx.stroke()
	}

	private drawHead(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 155 + HEAD_RADIUS
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.arc(x, y, HEAD_RADIUS, 0, Math.PI * 2)
		this.ctx.stroke()
	}

	private drawBody(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 125
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x, y + 50)
		this.ctx.stroke()
	}

	private drawLeftArm(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 115
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x - 25, y + 30)
		this.ctx.stroke()
	}

	private drawRightArm(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 115
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x + 25, y + 30)
		this.ctx.stroke()
	}

	private drawLeftLeg(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 75
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x - 20, y + 40)
		this.ctx.stroke()
	}

	private drawRightLeg(): void {
		const x = this.origin.x + 120
		const y = this.origin.y - 75
		this.ctx.strokeStyle = BODY_COLOR
		this.ctx.lineWidth = 3

		this.ctx.beginPath()
		this.ctx.moveTo(x, y)
		this.ctx.lineTo(x + 20, y + 40)
		this.ctx.stroke()
	}
}

export {
	HangmanRenderer,
	type Point,
}
