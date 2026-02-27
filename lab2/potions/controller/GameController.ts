import {type GameModel, type Listener} from '../model/GameModel'
import {type ElementId, type GameStateSnapshot} from '../model/types'
import {type DragPreview, type GameRenderer} from '../view/GameRenderer'
import {type SoundManager} from './SoundManager'

class GameController {
	private readonly model: GameModel
	private readonly view: GameRenderer
	private readonly sound: SoundManager
	private lastSnapshotElements = 0
	private readonly canvas: HTMLCanvasElement

	private dragSource: {
		source: 'discovered' | 'board',
		elementId: ElementId,
		instanceId: string | null,
	} | null = null

	constructor(model: GameModel, view: GameRenderer, sound: SoundManager, canvas: HTMLCanvasElement) {
		this.model = model
		this.view = view
		this.sound = sound
		this.canvas = canvas

		const listener: Listener = snapshot => {
			this.handleChange(snapshot)
		}

		this.model.subscribe(listener)
		this.bindMouseEvents()
	}

	startNewGame(): void {
		this.model.reset()
	}

	private handleChange(snapshot: GameStateSnapshot): void {
		if (snapshot.message) {
			this.sound.playNewCombination()
		}

		if (snapshot.openedElements.length > this.lastSnapshotElements) {
			this.sound.playNewElement()
		}

		this.lastSnapshotElements = snapshot.openedElements.length
	}

	private bindMouseEvents(): void {
		this.canvas.addEventListener('mousedown', event => {
			const {x, y} = this.toCanvasCoordinates(event)
			this.handleMouseDown(x, y)
		})

		this.canvas.addEventListener('mousemove', event => {
			const {x, y} = this.toCanvasCoordinates(event)
			this.handleMouseMove(x, y)
		})

		this.canvas.addEventListener('mouseup', event => {
			const {x, y} = this.toCanvasCoordinates(event)
			this.handleMouseUp(x, y)
		})

		this.canvas.addEventListener('mouseleave', () => {
			this.dragSource = null
			this.view.setDragPreview(null)
		})
	}

	private handleMouseDown(x: number, y: number): void {
		const discoveredId = this.view.getDiscoveredElementAt(x, y)
		if (discoveredId) {
			this.dragSource = {
				source: 'discovered',
				elementId: discoveredId,
				instanceId: null,
			}

			const preview: DragPreview = {
				elementId: discoveredId,
				x,
				y,
			}

			this.view.setDragPreview(preview)

			return
		}

		const boardItem = this.view.getBoardItemAt(x, y)
		if (boardItem) {
			this.dragSource = {
				source: 'board',
				elementId: boardItem.elementId,
				instanceId: boardItem.instanceId,
			}

			const preview: DragPreview = {
				elementId: boardItem.elementId,
				x,
				y,
			}

			this.view.setDragPreview(preview)
		}
	}

	private handleMouseMove(x: number, y: number): void {
		if (!this.dragSource) {
			return
		}

		const preview: DragPreview = {
			elementId: this.dragSource.elementId,
			x,
			y,
		}

		this.view.setDragPreview(preview)
	}

	private handleMouseUp(x: number, y: number): void {
		if (!this.dragSource) {
			return
		}

		const source = this.dragSource
		this.dragSource = null
		this.view.setDragPreview(null)

		const boardItem = this.view.getBoardItemAt(x, y)
		const inTrash = this.view.isInsideTrash(x, y)
		const inBoardArea = this.view.isInsideBoardArea(x, y)

		if (inTrash && source.source === 'board' && source.instanceId) {
			this.model.removeFromBoard(source.instanceId)

			return
		}

		if (boardItem) {
			if (source.source === 'discovered') {
				this.model.addToBoard(source.elementId)

				const snapshot = this.model.getSnapshot()
				const last = snapshot.boardItems[snapshot.boardItems.length - 1]
				if (last) {
					this.model.combine(last.instanceId, boardItem.instanceId)
				}
			}
			else if (source.source === 'board' && source.instanceId) {
				this.model.combine(source.instanceId, boardItem.instanceId)
			}

			return
		}

		if (inBoardArea && source.source === 'discovered') {
			this.model.addToBoard(source.elementId)
		}
	}

	private toCanvasCoordinates(event: MouseEvent): {
		x: number,
		y: number,
	} {
		const rect = this.canvas.getBoundingClientRect()
		const scaleX = this.canvas.width / rect.width
		const scaleY = this.canvas.height / rect.height
		const x = (event.clientX - rect.left) * scaleX
		const y = (event.clientY - rect.top) * scaleY

		return {
			x,
			y,
		}
	}
}

export {
	GameController,
}

