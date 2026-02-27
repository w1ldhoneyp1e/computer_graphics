import {type GameRepository} from './GameRepository'
import {
	type BoardItem,
	type ElementId,
	type GameStateSnapshot,
	type RecipeIndexEntry,
} from './types'

type Listener = (snapshot: GameStateSnapshot) => void

class GameModel {
	private readonly repo: GameRepository
	private readonly opened = new Set<ElementId>()
	private board: BoardItem[] = []
	private readonly listeners = new Set<Listener>()
	private message: string | null = null
	private isCompleted = false
	private readonly recipesIndex: Map<string, RecipeIndexEntry>

	constructor(repo: GameRepository) {
		this.repo = repo
		this.recipesIndex = this.buildRecipeIndex()

		const initial = this.repo.getInitialElements()
		for (const id of initial) {
			this.opened.add(id)
		}
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener)

		return () => {
			this.listeners.delete(listener)
		}
	}

	reset(): void {
		this.opened.clear()
		this.board = []
		this.message = null
		this.isCompleted = false

		const initial = this.repo.getInitialElements()
		for (const id of initial) {
			this.opened.add(id)
		}

		this.notify()
	}

	addToBoard(elementId: ElementId): void {
		if (this.isCompleted) {
			return
		}

		const instanceId = this.createInstanceId()
		this.board.push({
			instanceId,
			elementId,
		})

		this.message = null
		this.notify()
	}

	removeFromBoard(instanceId: string): void {
		const index = this.board.findIndex(item => item.instanceId === instanceId)
		if (index === -1) {
			return
		}

		this.board.splice(index, 1)
		this.message = null
		this.notify()
	}

	combine(sourceId: string, targetId: string): void {
		if (this.isCompleted) {
			return
		}

		if (sourceId === targetId) {
			return
		}

		const source = this.board.find(item => item.instanceId === sourceId)
		const target = this.board.find(item => item.instanceId === targetId)
		if (!source || !target) {
			return
		}

		const key = this.getRecipeKey(source.elementId, target.elementId)
		const recipe = this.recipesIndex.get(key)

		if (!recipe) {
			this.message = 'Комбинация не сработала. Ничего не произошло.'
			this.notify()

			return
		}

		this.board = this.board.filter(item => item.instanceId !== sourceId && item.instanceId !== targetId)

		const openedBefore = new Set(this.opened)
		for (const resultId of recipe.outputs) {
			const instanceId = this.createInstanceId()
			this.board.push({
				instanceId,
				elementId: resultId,
			})
			this.opened.add(resultId)
		}

		const newElements: ElementId[] = []
		for (const id of this.opened) {
			if (!openedBefore.has(id)) {
				newElements.push(id)
			}
		}

		if (newElements.length === 0) {
			this.message = recipe.message
		}
		else if (newElements.length === 1) {
			const total = this.repo.getAllElements().length
			this.message = `${recipe.message} Открыт новый элемент (${this.opened.size}/${total}).`
		}
		else {
			const total = this.repo.getAllElements().length
			this.message = `${recipe.message} Открыто новых элементов: ${newElements.length} (${this.opened.size}/${total}).`
		}

		this.checkCompletion()
		this.notify()
	}

	getSnapshot(): GameStateSnapshot {
		const total = this.repo.getAllElements().length

		return {
			openedElements: Array.from(this.opened),
			boardItems: this.board.slice(),
			message: this.message,
			totalElements: total,
			isCompleted: this.isCompleted,
		}
	}

	private notify(): void {
		const snapshot = this.getSnapshot()

		for (const listener of this.listeners) {
			listener(snapshot)
		}
	}

	private checkCompletion(): void {
		const total = this.repo.getAllElements().length
		if (this.opened.size >= total) {
			this.isCompleted = true

			if (!this.message) {
				this.message = 'Ты открыл все элементы!'
			}
		}
	}

	private buildRecipeIndex(): Map<string, RecipeIndexEntry> {
		const index = new Map<string, RecipeIndexEntry>()

		const recipes = this.repo.getAllRecipes()
		for (const recipe of recipes) {
			const key = this.getRecipeKey(recipe.inputA, recipe.inputB)
			index.set(key, {
				outputs: recipe.outputs,
				message: recipe.message,
			})
		}

		return index
	}

	private getRecipeKey(a: ElementId, b: ElementId): string {
		const [first, second] = [a, b].sort()

		return `${first}|${second}`
	}

	private createInstanceId(): string {
		const part = Math.random().toString(36)
			.slice(2, 9)

		return `i_${Date.now().toString(36)}_${part}`
	}
}

export {
	GameModel,
	type Listener,
}

