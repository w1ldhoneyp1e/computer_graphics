import {GameController} from './controller/GameController'
import {SoundManager} from './controller/SoundManager'
import {GameModel} from './model/GameModel'
import {GameRepository} from './model/GameRepository'
import {GameRenderer} from './view/GameRenderer'

async function init() {
	const repo = new GameRepository()
	await repo.loadFromUrl('/potions/data.json')

	const canvas = document.getElementById('canvas') as HTMLCanvasElement | null
	if (!canvas) {
		throw new Error('Не найден canvas с id="canvas"')
	}

	const ctx = canvas.getContext('2d')
	if (!ctx) {
		throw new Error('2d контекст недоступен')
	}

	const sound = new SoundManager()
	const model = new GameModel(repo)

	const view = new GameRenderer(canvas, ctx, repo)
	const controller = new GameController(model, view, sound, canvas)

	model.subscribe(snapshot => {
		view.render(snapshot)
	})

	initListeners(controller)

	controller.startNewGame()
}

function initListeners(controller: GameController) {
	const btnNewGame = document.getElementById('btn-new-game')
	if (btnNewGame) {
		btnNewGame.addEventListener('click', () => {
			controller.startNewGame()
		})
	}

	const btnRestart = document.getElementById('btn-restart')
	const btnClose = document.getElementById('btn-close')

	if (btnRestart) {
		btnRestart.addEventListener('click', () => {
			controller.startNewGame()
		})
	}

	if (btnClose) {
		btnClose.addEventListener('click', () => {
			const element = document.getElementById('overlay')
			if (element) {
				element.setAttribute('hidden', 'true')
			}
		})
	}
}

init().catch(error => {
	console.error('Ошибка инициализации игры Potions:', error)
})

