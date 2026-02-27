type ElementKind = 'ingredient' | 'potion'
type ElementId = string

type ElementDefinition = {
	id: ElementId,
	name: string,
	kind: ElementKind,
	imgUrl: string,
}

type Recipe = {
	inputA: ElementId,
	inputB: ElementId,
	output: ElementId,
	message: string,
}

type RecipeIndexEntry = {
	output: ElementId,
	message: string,
}

type BoardItem = {
	instanceId: string,
	elementId: ElementId,
}

type GameStateSnapshot = {
	openedElements: ElementId[],
	boardItems: BoardItem[],
	lastMessage: string | null,
	totalElements: number,
	isCompleted: boolean,
}

type DragSource = {
	source: 'discovered' | 'board',
	elementId: ElementId,
	instanceId: string | null,
}

export {
	type BoardItem,
	type DragSource,
	type ElementDefinition,
	type ElementId,
	type ElementKind,
	type GameStateSnapshot,
	type Recipe,
	type RecipeIndexEntry,
}

