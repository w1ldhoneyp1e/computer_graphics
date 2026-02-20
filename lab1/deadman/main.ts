import {GameController} from './GameController'
import {GameRenderer} from './GameRenderer'
import {WordRepository} from './WordRepository'

async function init() {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	const ctxOrNull = canvas.getContext('2d')

	if (!ctxOrNull) {
		throw new Error('2d context not available')
	}

	const repository = new WordRepository()
	await repository.loadFromUrl('/words.txt')

	const renderer = new GameRenderer(canvas, ctxOrNull)

	const ui = {
		canvas,
		overlay: document.getElementById('overlay') as HTMLElement,
		message: document.getElementById('game-over-message') as HTMLElement,
		btnNewGame: document.getElementById('btn-new-game'),
		btnQuit: document.getElementById('btn-quit'),
	}

	const controller = new GameController(repository, renderer, ui)
	controller.startNewGame()
}

init().catch(err => {
	console.error('Ошибка загрузки:', err)
})
