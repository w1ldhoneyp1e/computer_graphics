import {BOARD_COLS, BOARD_ROWS} from '../constants'
import {type GameRepository} from '../model/GameRepository'
import {
	type BoardItem,
	type ElementDefinition,
	type ElementId,
	type GameStateSnapshot,
} from '../model/types'

type Rect = {
	x: number,
	y: number,
	w: number,
	h: number,
}

type DiscoveredRect = Rect & {
	elementId: ElementId,
}

type BoardRect = Rect & {
	instanceId: string,
	elementId: ElementId,
}

type DragPreview = {
	elementId: ElementId,
	x: number,
	y: number,
}

class GameRenderer {
	private readonly repo: GameRepository
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private snapshot: GameStateSnapshot | null = null
	private discoveredRects: DiscoveredRect[] = []
	private boardRects: BoardRect[] = []
	private trashRect: Rect | null = null
	private boardAreaRect: Rect | null = null
	private dragPreview: DragPreview | null = null
	private readonly imageCache = new Map<ElementId, HTMLImageElement>()

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, repo: GameRepository) {
		this.repo = repo
		this.canvas = canvas
		this.ctx = ctx
		this.preloadImages()
	}

	private preloadImages(): void {
		const elements = this.repo.getAllElements()
		for (const el of elements) {
			const img = new Image()
			img.src = el.img_url
			img.onload = () => {
				this.imageCache.set(el.id, img)
				if (this.snapshot) {
					this.render(this.snapshot)
				}
			}
		}
	}

	private drawElementImg(element: ElementDefinition, x: number, y: number, size: number): void {
		const img = this.imageCache.get(element.id)
		if (img && img.complete && img.naturalWidth > 0) {
			this.ctx.drawImage(img, x, y - size / 2, size, size)
		}
		else {
			this.ctx.textBaseline = 'middle'
			this.ctx.fillText(element.name.charAt(0), x, y)
		}
	}

	render(snapshot: GameStateSnapshot): void {
		this.snapshot = snapshot

		this.clear()
		this.drawBackground()
		this.drawFrame()
		this.drawDiscovered(snapshot.openedElements)
		this.drawBoard(snapshot.boardItems)
		this.drawTrash()
		this.drawProgress(snapshot.openedElements.length, snapshot.totalElements)
		const displayText = snapshot.lastMessage ?? 'Начни с базовых ингредиентов и открой все зелья.'
		this.drawMessage(displayText)

		if (this.dragPreview) {
			this.drawDragPreview(this.dragPreview)
		}
	}

	setDragPreview(preview: DragPreview | null): void {
		this.dragPreview = preview
		if (this.snapshot) {
			this.render(this.snapshot)
		}
	}

	getDiscoveredElementAt(x: number, y: number): ElementId | null {
		for (const rect of this.discoveredRects) {
			if (this.isInside(rect, x, y)) {
				return rect.elementId
			}
		}

		return null
	}

	getBoardItemAt(x: number, y: number): BoardRect | null {
		for (const rect of this.boardRects) {
			if (this.isInside(rect, x, y)) {
				return rect
			}
		}

		return null
	}

	isInsideBoardArea(x: number, y: number): boolean {
		if (!this.boardAreaRect) {
			return false
		}

		return this.isInside(this.boardAreaRect, x, y)
	}

	isInsideTrash(x: number, y: number): boolean {
		if (!this.trashRect) {
			return false
		}

		return this.isInside(this.trashRect, x, y)
	}

	private clear(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	private drawBackground(): void {
		const {width, height} = this.canvas
		this.ctx.fillStyle = '#fdf7eb'
		this.ctx.fillRect(0, 0, width, height)
	}

	private drawFrame(): void {
	}

	private drawDiscovered(ids: ElementId[]): void {
		const allElements = this.repo.getAllElements()
		const elements: ElementDefinition[] = []

		for (const id of ids) {
			const found = allElements.find(element => element.id === id)
			if (found) {
				elements.push(found)
			}
		}

		elements.sort((a, b) => a.name.localeCompare(b.name, 'ru'))

		const startX = 50
		const startY = 60
		const cardW = 190
		const cardH = 40
		const gapY = 8
		const maxPerColumn = 10

		this.discoveredRects = []

		this.ctx.font = '13px Roboto'
		this.ctx.textBaseline = 'middle'

		for (let index = 0; index < elements.length; index++) {
			const element = elements[index]
			if (!element) {
				continue
			}

			const column = Math.floor(index / maxPerColumn)
			const row = index % maxPerColumn
			const x = startX + column * (cardW + 12)
			const y = startY + row * (cardH + gapY)

			const rect: DiscoveredRect = {
				x,
				y,
				w: cardW,
				h: cardH,
				elementId: element.id,
			}

			this.discoveredRects.push(rect)

			this.ctx.fillStyle = 'rgba(250, 243, 221, 0.9)'
			this.ctx.fillRect(x, y, cardW, cardH)

			this.ctx.strokeStyle = '#d1b890'
			this.ctx.lineWidth = 1
			this.ctx.strokeRect(x + 0.5, y + 0.5, cardW - 1, cardH - 1)

			this.ctx.font = '13px Roboto'
			this.ctx.fillStyle = '#1f2933'
			this.drawElementImg(element, x + 8, y + cardH / 2, 24)

			this.ctx.fillStyle = '#292421'
			this.ctx.fillText(element.name, x + 34, y + cardH / 2)
		}
	}

	private drawBoard(items: BoardItem[]): void {
		const boardX = 650
		const boardY = 60
		const boardW = 500
		const boardH = 430

		this.boardAreaRect = {
			x: boardX,
			y: boardY,
			w: boardW,
			h: boardH,
		}

		this.ctx.fillStyle = '#f6ecd7'
		this.ctx.fillRect(boardX, boardY, boardW, boardH)

		this.ctx.strokeStyle = '#d1b890'
		this.ctx.lineWidth = 1
		this.ctx.strokeRect(boardX + 0.5, boardY + 0.5, boardW - 1, boardH - 1)

		const cols = BOARD_COLS
		const rows = BOARD_ROWS
		const cellW = boardW / cols
		const cellH = boardH / rows

		this.ctx.strokeStyle = '#dfcfb4'
		this.ctx.lineWidth = 1
		for (let i = 1; i < cols; i++) {
			const x = boardX + i * cellW
			this.ctx.beginPath()
			this.ctx.moveTo(x, boardY + 6)
			this.ctx.lineTo(x, boardY + boardH - 6)
			this.ctx.stroke()
		}
		for (let j = 1; j < rows; j++) {
			const y = boardY + j * cellH
			this.ctx.beginPath()
			this.ctx.moveTo(boardX + 6, y)
			this.ctx.lineTo(boardX + boardW - 6, y)
			this.ctx.stroke()
		}

		this.boardRects = []

		const allElements = this.repo.getAllElements()

		for (let index = 0; index < items.length; index++) {
			const item = items[index]
			if (!item) {
				continue
			}

			const element = allElements.find(candidate => candidate.id === item.elementId)
			if (!element) {
				continue
			}

			const col = index % cols
			const row = Math.floor(index / cols)
			const x = boardX + col * cellW + 16
			const y = boardY + row * cellH + 18
			const w = cellW - 32
			const h = cellH - 32

			const rect: BoardRect = {
				x,
				y,
				w,
				h,
				instanceId: item.instanceId,
				elementId: item.elementId,
			}

			this.boardRects.push(rect)

			this.ctx.fillStyle = '#fbf5e6'
			this.ctx.fillRect(x, y, w, h)

			this.ctx.strokeStyle = '#d1b890'
			this.ctx.lineWidth = 1
			this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

			const imgSize = 60
			this.drawElementImg(element, x + w / 2 - imgSize / 2, y + h / 2, imgSize)
		}
	}

	private drawTrash(): void {
		const x = 520
		const y = 550
		const w = 120
		const h = 60

		this.trashRect = {
			x,
			y,
			w,
			h,
		}

		this.ctx.fillStyle = '#f3dfd9'
		this.ctx.fillRect(x, y, w, h)

		this.ctx.strokeStyle = '#e3b4ac'
		this.ctx.lineWidth = 1
		this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

		this.ctx.font = '28px Roboto'
		this.ctx.textBaseline = 'middle'
		this.ctx.fillStyle = '#8b1a1a'
		this.ctx.fillText('✕', x + 16, y + h / 2)

		this.ctx.font = '13px Roboto'
		this.ctx.fillText('Корзина', x + 50, y + h / 2)
	}

	private drawProgress(current: number, total: number): void {
		const x = 680
		const y = 550
		const w = 380
		const h = 60

		this.ctx.fillStyle = '#f2ead9'
		this.ctx.fillRect(x, y, w, h)

		this.ctx.strokeStyle = '#d1b890'
		this.ctx.lineWidth = 1
		this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

		this.ctx.font = '12px Roboto'
		this.ctx.fillStyle = '#6b5a45'
		this.ctx.textBaseline = 'top'
		this.ctx.fillText('Открыто элементов', x + 10, y + 8)

		this.ctx.font = '18px Roboto'
		this.ctx.textBaseline = 'middle'
		this.ctx.fillText(String(current), x + 10, y + h / 2 + 8)

		this.ctx.font = '14px Roboto'
		this.ctx.fillStyle = '#9b8b74'
		this.ctx.fillText('/', x + 40, y + h / 2 + 8)
		this.ctx.fillText(String(total), x + 52, y + h / 2 + 8)

		const barX = x + 110
		const barY = y + h / 2 + 8
		const barW = w - 130
		const barH = 8

		this.ctx.fillStyle = '#e3d5bb'
		this.ctx.fillRect(barX, barY, barW, barH)

		if (total <= 0) {
			return
		}

		const ratio = Math.max(0, Math.min(1, current / total))
		const fillW = barW * ratio

		this.ctx.fillStyle = '#4d9b6a'
		this.ctx.fillRect(barX, barY, fillW, barH)
	}

	private drawMessage(displayText: string): void {
		const x = 50
		const y = 550
		const w = 430
		const h = 60

		this.ctx.fillStyle = '#f2ead9'
		this.ctx.fillRect(x, y, w, h)

		this.ctx.strokeStyle = '#d1b890'
		this.ctx.lineWidth = 1
		this.ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

		this.ctx.font = '13px Roboto'
		this.ctx.fillStyle = '#6b5a45'
		this.ctx.textBaseline = 'top'

		const words = displayText.split(' ')
		let currentLine = ''
		let offsetY = y + 8

		for (const word of words) {
			const testLine = currentLine.length === 0
				? word
				: `${currentLine} ${word}`
			const metrics = this.ctx.measureText(testLine)
			if (metrics.width > w - 16 && currentLine.length > 0) {
				this.ctx.fillText(currentLine, x + 8, offsetY)
				currentLine = word
				offsetY += 16
			}
			else {
				currentLine = testLine
			}
		}

		if (currentLine.length > 0) {
			this.ctx.fillText(currentLine, x + 8, offsetY)
		}
	}

	private drawDragPreview(preview: DragPreview): void {
		const element = this.repo.getElementById(preview.elementId)
		const w = 140
		const h = 40
		const x = preview.x - w / 2
		const y = preview.y - h / 2

		this.ctx.globalAlpha = 0.85
		this.ctx.fillStyle = 'rgba(242, 234, 211, 0.95)'
		this.ctx.fillRect(x, y, w, h)

		this.ctx.font = '24px Roboto'
		this.ctx.textBaseline = 'middle'
		this.ctx.fillStyle = '#1f2933'
		this.drawElementImg(element, x + 8, y + h / 2, 24)

		this.ctx.font = '13px Roboto'
		this.ctx.fillStyle = '#292421'
		this.ctx.fillText(element.name, x + 40, y + h / 2)
		this.ctx.globalAlpha = 1
	}

	private isInside(rect: Rect, x: number, y: number): boolean {
		const insideX = x >= rect.x && x <= rect.x + rect.w
		const insideY = y >= rect.y && y <= rect.y + rect.h

		return insideX && insideY
	}
}

export {
	GameRenderer,
	type BoardRect,
	type DiscoveredRect,
	type DragPreview,
}

