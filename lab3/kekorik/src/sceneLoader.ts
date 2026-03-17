import type {SceneData} from './types'

const isFiniteNumber = (value: unknown): value is number => {
	const ok = typeof value === 'number' && Number.isFinite(value)

	return ok
}

const loadScene = async (url: string): Promise<SceneData> => {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Не удалось загрузить сцену: ${response.status}`)
	}
	const raw = (await response.json()) as unknown
	if (!raw || typeof raw !== 'object') {
		throw new Error('Файл сцены имеет неверный формат')
	}
	const scene = raw as Partial<SceneData>
	if (!Array.isArray(scene.background) || scene.background.length !== 4 || !scene.background.every(isFiniteNumber)) {
		throw new Error('В сцене задан некорректный цвет фона')
	}
	if (!Array.isArray(scene.template) || !Array.isArray(scene.instances)) {
		throw new Error('В сцене отсутствуют обязательные массивы')
	}

	return scene as SceneData
}

export {loadScene}
