import {
	type GameModel,
	type LetterStatus,
	ALPHABET,
} from './GameModel'
import {HangmanRenderer} from './HangmanRenderer'

const LETTER_CELL_W = 32
const LETTER_CELL_H = 36
const LETTERS_PER_ROW = 11

const LETTER_FONT = 'bold 24px sans-serif'
const WORD_FONT = '28px monospace'
const HINT_FONT = '16px sans-serif'

const COLOR_CORRECT = '#2e7d32'
const COLOR_WRONG = '#c62828'
const COLOR_UNUSED = '#37474f'
const COLOR_TEXT = '#1a1a1a'
const COLOR_BG = '#fafafa'

type LetterRect = {
	letter: string,
	x: number,
	y: number,
	w: number,
	h: number,
}

class GameRenderer {
	private readonly letterRects: LetterRect[]
	private readonly hangmanRenderer: HangmanRenderer

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly ctx: CanvasRenderingContext2D,
	) {
		this.letterRects = this.createLetterRects()
		this.hangmanRenderer = new HangmanRenderer(this.ctx, {
			x: 80,
			y: 320,
		})
	}

	render(model: GameModel): void {
		this.clearCanvas()

		this.hangmanRenderer.draw(model.getWrongCount())

		this.drawHint(model.hint)
		this.drawMaskedWord(model.getMaskedWord())
		this.drawAlphabetGrid(model)
	}

	getLetterAtPosition(mouseX: number, mouseY: number): string | null {
		for (const rect of this.letterRects) {
			const isInsideX = mouseX >= rect.x && mouseX <= rect.x + rect.w
			const isInsideY = mouseY >= rect.y && mouseY <= rect.y + rect.h

			if (isInsideX && isInsideY) {
				return rect.letter
			}
		}

		return null
	}

	private clearCanvas(): void {
		this.ctx.fillStyle = COLOR_BG
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	private drawHint(hint: string): void {
		this.ctx.fillStyle = COLOR_TEXT
		this.ctx.font = HINT_FONT
		this.ctx.fillText(`Подсказка: ${hint}`, 80, 380, 600)
	}

	private drawMaskedWord(maskedWord: string): void {
		this.ctx.fillStyle = COLOR_TEXT
		this.ctx.font = WORD_FONT
		this.ctx.letterSpacing = '6px'
		this.ctx.fillText(maskedWord, 80, 420, 600)
	}

	private drawAlphabetGrid(model: GameModel): void {
		this.ctx.font = LETTER_FONT
		for (const rect of this.letterRects) {
			const status = model.getLetterStatus(rect.letter)
			this.ctx.fillStyle = this.getColorForStatus(status)
			this.ctx.fillText(rect.letter, rect.x + 4, rect.y + 28)
		}
	}

	private getColorForStatus(status: LetterStatus): string {
		switch (status) {
			case 'correct':
				return COLOR_CORRECT
			case 'wrong':
				return COLOR_WRONG
			default:
				return COLOR_UNUSED
		}
	}

	private createLetterRects(): LetterRect[] {
		const startX = 700
		const startY = 280
		const rects: LetterRect[] = []
		let row = 0
		let col = 0

		for (const letter of ALPHABET) {
			const x = startX + col * (LETTER_CELL_W + 4)
			const y = startY + row * (LETTER_CELL_H + 4)

			rects.push({
				letter,
				x,
				y,
				w: LETTER_CELL_W,
				h: LETTER_CELL_H,
			})

			col++
			if (col >= LETTERS_PER_ROW) {
				col = 0
				row++
			}
		}

		return rects
	}
}

export {
	GameRenderer,
}
