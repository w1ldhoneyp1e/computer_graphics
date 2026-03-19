import {distanceSquared} from './math'
import {buildPrimitiveSet} from './primitives/factory'
import {type Primitive} from './primitives/Primitive'
import {
	type Color,
	type DragState,
	type SceneData,
	type SceneInstance,
	type Vec2,
} from './types'

const HIT_RADIUS = 230

class KekorikModel {
	private readonly background: Color
	private readonly primitives: Primitive[]
	private readonly instances: SceneInstance[]
	private dragState: DragState | null = null

	constructor(scene: SceneData) {
		this.background = scene.background
		this.primitives = buildPrimitiveSet(scene.template)
		this.instances = scene.instances.map(instance => ({
			position: [instance.position[0], instance.position[1]],
			scale: instance.scale,
			colorOverrides: {...instance.colorOverrides},
		}))
	}

	getBackground(): Color {
		const background = this.background

		return background
	}

	getPrimitives(): Primitive[] {
		const primitives = this.primitives

		return primitives
	}

	getInstances(): SceneInstance[] {
		const instances = this.instances

		return instances
	}

	isDragging(): boolean {
		const dragging = this.dragState !== null

		return dragging
	}

	pickInstance(point: Vec2): number | null {
		for (let i = this.instances.length - 1; i >= 0; i -= 1) {
			const instance = this.instances[i]
			if (!instance) {
				continue
			}
			const radius = HIT_RADIUS * instance.scale
			const hit = distanceSquared(point, instance.position) <= radius * radius
			if (hit) {
				return i
			}
		}

		return null
	}

	beginDrag(instanceIndex: number, point: Vec2): boolean {
		const selected = this.instances[instanceIndex]
		if (!selected) {
			return false
		}
		this.dragState = {
			instanceIndex,
			offset: [selected.position[0] - point[0], selected.position[1] - point[1]],
		}

		return true
	}

	updateDrag(point: Vec2): void {
		if (!this.dragState) {
			return
		}
		const instance = this.instances[this.dragState.instanceIndex]
		if (!instance) {
			return
		}
		instance.position = [point[0] + this.dragState.offset[0], point[1] + this.dragState.offset[1]]
	}

	endDrag(): void {
		this.dragState = null
	}
}

export {
	KekorikModel,
}
