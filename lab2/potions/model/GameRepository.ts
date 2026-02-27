import {
	type ElementDefinition,
	type ElementId,
	type Recipe,
} from './types'

type GameConfigJson = {
	elements: ElementDefinition[],
	initialElements: ElementId[],
	recipes: Recipe[],
}

class GameRepository {
	private elements: ElementDefinition[] = []
	private initialElements: ElementId[] = []
	private recipes: Recipe[] = []

	async loadFromUrl(url: string): Promise<void> {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`Не удалось загрузить данные игры: ${response.status}`)
		}

		const json = await response.json() as GameConfigJson
		this.elements = json.elements ?? []
		this.initialElements = json.initialElements ?? []
		this.recipes = json.recipes ?? []
	}

	getElementById(id: ElementId): ElementDefinition {
		const element = this.elements.find(candidate => candidate.id === id)
		if (!element) {
			throw new Error(`Неизвестный элемент: ${id}`)
		}

		return element
	}

	getAllElements(): ElementDefinition[] {
		return this.elements.slice()
	}

	getInitialElements(): ElementId[] {
		return this.initialElements.slice()
	}

	getAllRecipes(): Recipe[] {
		return this.recipes.slice()
	}
}

export {
	GameRepository,
}
