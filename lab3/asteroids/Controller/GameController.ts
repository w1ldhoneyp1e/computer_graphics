/* eslint-disable no-alert */
import {type GameModel} from '../Model/GameModel'
import {type GameRenderer} from '../View/GameRenderer'
import {type InputManager} from './InputManager'
import {type SoundManager} from './SoundManager'

type GameControllerProps = {
	model: GameModel,
	view: GameRenderer,
	sound: SoundManager,
	input: InputManager,
	gl: WebGLRenderingContext,
}

class GameController {
	private readonly model: GameModel
	private readonly view: GameRenderer
	private readonly sound: SoundManager
	private readonly input: InputManager
	private readonly gl: WebGLRenderingContext
	private readonly scoreEl: HTMLElement | null
	private readonly livesEl: HTMLElement | null
	private gameOver = false

	constructor({
		model,
		view,
		sound,
		input,
		gl,
	}: GameControllerProps) {
		this.model = model
		this.view = view
		this.sound = sound
		this.input = input
		this.gl = gl
		this.scoreEl = document.getElementById('score')
		this.livesEl = document.getElementById('lives')
	}

	start(): void {
		this.input.bind()
		this.updateUi()
		this.gameLoop()
	}

	private updateUi(): void {
		const state = this.model.getState()
		if (this.scoreEl) {
			this.scoreEl.textContent = `Очки: ${state.score}`
		}
		if (this.livesEl) {
			this.livesEl.textContent = `Жизни: ${state.lives}`
		}
	}

	private gameLoop = (): void => {
		if (this.gameOver) {
			return
		}

		const result = this.model.step(this.input.state)
		const state = result.state

		if (result.shot) {
			this.sound.playShoot()
		}
		if (result.hit) {
			this.sound.playHit()
		}
		if (result.destroyed) {
			this.sound.playDestroy()
		}
		if (result.shipExploded) {
			this.sound.playShipExplode()
		}

		if (result.gameOvered) {
			this.gameOver = true
			const again = window.confirm(`Игра окончена. Очки: ${state.score}. Начать заново?`)
			if (again) {
				this.model.reset()
				this.gameOver = false
				this.updateUi()
			}
			requestAnimationFrame(this.gameLoop)
			return
		}

		this.updateUi()
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)
		this.view.drawShip(state.ship)
		for (const a of state.asteroids) {
			this.view.drawAsteroid(a)
		}
		this.view.drawBullets(state.bullets)
		requestAnimationFrame(this.gameLoop)
	}
}

export {
	GameController,
}
