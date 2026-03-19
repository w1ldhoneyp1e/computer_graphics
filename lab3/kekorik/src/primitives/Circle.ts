import {TAU, transformPoint} from '../math'
import {
	type CircleCommand,
	type Color,
	type SceneInstance,
	type Vec2,
} from '../types'
import {type BuiltGeometry, type Primitive} from './Primitive'

class Circle implements Primitive {
	readonly id: string
	readonly baseColor: Color
	private readonly center: Vec2
	private readonly radius: number
	private readonly segments: number

	constructor(data: CircleCommand) {
		this.id = data.id
		this.baseColor = data.color
		this.center = data.center
		this.radius = data.radius
		this.segments = data.segments ?? 52
	}

	build(instance: SceneInstance, colorOverride?: Color): BuiltGeometry {
		const center = transformPoint(this.center, instance.position, instance.scale)
		const radius = this.radius * instance.scale
		const vertices: number[] = []

		for (let i = 0; i < this.segments; i += 1) {
			const t0 = (i / this.segments) * TAU
			const t1 = ((i + 1) / this.segments) * TAU
			const p0x = center[0] + Math.cos(t0) * radius
			const p0y = center[1] + Math.sin(t0) * radius
			const p1x = center[0] + Math.cos(t1) * radius
			const p1y = center[1] + Math.sin(t1) * radius
			vertices.push(center[0], center[1], p0x, p0y, p1x, p1y)
		}

		return {
			id: this.id,
			color: colorOverride ?? this.baseColor,
			vertices: new Float32Array(vertices),
		}
	}
}

export {
	Circle,
}
