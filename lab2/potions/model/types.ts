type ElementKind = 'ingredient' | 'potion'
type ElementId = string

type ElementDefinition = {
	id: ElementId,
	name: string,
	kind: ElementKind,
	accent: string,
	icon: string,
}

type Recipe = {
	inputA: ElementId,
	inputB: ElementId,
	outputs: ElementId[],
	message: string,
}

type RecipeIndexEntry = {
	outputs: ElementId[],
	message: string,
}

type BoardItem = {
	instanceId: string,
	elementId: ElementId,
}

type GameStateSnapshot = {
	openedElements: ElementId[],
	boardItems: BoardItem[],
	message: string | null,
	totalElements: number,
	isCompleted: boolean,
}

export {
	type BoardItem,
	type ElementDefinition,
	type ElementId,
	type ElementKind,
	type GameStateSnapshot,
	type Recipe,
	type RecipeIndexEntry,
}

