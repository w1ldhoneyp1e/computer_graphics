import {transformPoint} from '../math'
import {
	type Color,
	type RingArcCommand,
	type SceneInstance,
	type Vec2,
} from '../types'
import {type BuiltGeometry, type Primitive} from './Primitive'

class RingArc implements Primitive {
	readonly id: string
	readonly baseColor: Color
	private readonly center: Vec2
	private readonly innerRadius: number
	private readonly outerRadius: number
	private readonly startAngle: number
	private readonly endAngle: number
	private readonly segments: number

	constructor(data: RingArcCommand) {
		this.id = data.id
		this.baseColor = data.color
		this.center = data.center
		this.innerRadius = data.innerRadius
		this.outerRadius = data.outerRadius
		this.startAngle = data.startAngle
		this.endAngle = data.endAngle
		this.segments = data.segments ?? 24
	}

	build(instance: SceneInstance, colorOverride?: Color): BuiltGeometry {
		const center = transformPoint(this.center, instance.position, instance.scale)
		const inner = this.innerRadius * instance.scale
		const outer = this.outerRadius * instance.scale
		const vertices: number[] = []

		for (let i = 0; i < this.segments; i += 1) {
			const t0 = this.startAngle + ((this.endAngle - this.startAngle) * i) / this.segments
			const t1 = this.startAngle + ((this.endAngle - this.startAngle) * (i + 1)) / this.segments
			const p0o: Vec2 = [center[0] + Math.cos(t0) * outer, center[1] + Math.sin(t0) * outer]
			const p0i: Vec2 = [center[0] + Math.cos(t0) * inner, center[1] + Math.sin(t0) * inner]
			const p1o: Vec2 = [center[0] + Math.cos(t1) * outer, center[1] + Math.sin(t1) * outer]
			const p1i: Vec2 = [center[0] + Math.cos(t1) * inner, center[1] + Math.sin(t1) * inner]
			vertices.push(p0o[0], p0o[1], p0i[0], p0i[1], p1o[0], p1o[1])
			vertices.push(p0i[0], p0i[1], p1i[0], p1i[1], p1o[0], p1o[1])
		}

		return {
			id: this.id,
			color: colorOverride ?? this.baseColor,
			vertices: new Float32Array(vertices),
		}
	}
}

export {
	RingArc,
}
