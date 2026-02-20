import {GameModel} from './GameModel'
import {type GameRenderer} from './GameRenderer'
import {type WordRepository} from './WordRepository'

type UIComponents = {
	canvas: HTMLCanvasElement,
	overlay: HTMLElement,
	message: HTMLElement,
	btnNewGame: HTMLElement | null,
	btnQuit: HTMLElement | null,
}

class GameController {
	private model: GameModel | null = null

	constructor(
		private readonly repository: WordRepository,
		private readonly renderer: GameRenderer,
		private readonly ui: UIComponents,
	) {
		this.bindEvents()
	}

	startNewGame(): void {
		const entry = this.repository.pickRandom()
		this.model = new GameModel(entry.word, entry.hint)
		this.ui.overlay.style.display = 'none'
		this.renderer.render(this.model)
	}

	private bindEvents(): void {
		this.ui.canvas.addEventListener('click', event => this.handleCanvasClick(event))

		if (this.ui.btnNewGame) {
			this.ui.btnNewGame.addEventListener('click', () => {
				this.startNewGame()
			})
		}

		if (this.ui.btnQuit) {
			this.ui.btnQuit.addEventListener('click', () => {
				window.close()
			})
		}
	}

	private handleCanvasClick(event: MouseEvent): void {
		if (!this.model || this.model.isGameOver()) {
			return
		}

		const rect = this.ui.canvas.getBoundingClientRect()
		const scaleX = this.ui.canvas.width / rect.width
		const scaleY = this.ui.canvas.height / rect.height
		const mouseX = (event.clientX - rect.left) * scaleX
		const mouseY = (event.clientY - rect.top) * scaleY

		const letter = this.renderer.getLetterAtPosition(mouseX, mouseY)
		if (!letter || this.model.isLetterAlreadyChosen(letter)) {
			return
		}

		this.model.tryLetter(letter)
		this.renderer.render(this.model)

		if (this.model.isGameOver()) {
			this.showGameOver(this.model.isWon())
		}
	}

	private showGameOver(won: boolean): void {
		if (!this.model) {
			return
		}

		this.ui.message.textContent = won
			? 'Поздравляем! Вы выиграли!'
			: `Вы проиграли. Загаданное слово: ${this.model.word}`
		this.ui.overlay.style.display = 'flex'
	}
}

export {
	GameController,
	type UIComponents,
}
