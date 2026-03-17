import {TAU, transformPoint} from './math'
import type {
	CircleCommand,
	Color,
	PolygonCommand,
	PrimitiveCommand,
	RingArcCommand,
	SceneInstance,
	Vec2,
} from './types'

type BuiltGeometry = {
	id: string
	color: Color
	vertices: Float32Array
}

interface PrimitiveRenderer {
	id: string
	baseColor: Color
	build(instance: SceneInstance, colorOverride?: Color): BuiltGeometry
}

class CirclePrimitive implements PrimitiveRenderer {
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

class PolygonPrimitive implements PrimitiveRenderer {
	readonly id: string
	readonly baseColor: Color
	private readonly points: Vec2[]

	constructor(data: PolygonCommand) {
		this.id = data.id
		this.baseColor = data.color
		this.points = data.points
	}

	build(instance: SceneInstance, colorOverride?: Color): BuiltGeometry {
		const vertices: number[] = []
		const count = this.points.length
		if (count >= 3) {
			const firstPoint = this.points[0]
			if (!firstPoint) {
				return {
					id: this.id,
					color: colorOverride ?? this.baseColor,
					vertices: new Float32Array(vertices),
				}
			}
			const first = transformPoint(firstPoint, instance.position, instance.scale)
			for (let i = 1; i < count - 1; i += 1) {
				const secondPoint = this.points[i]
				const thirdPoint = this.points[i + 1]
				if (!secondPoint || !thirdPoint) {
					continue
				}
				const second = transformPoint(secondPoint, instance.position, instance.scale)
				const third = transformPoint(thirdPoint, instance.position, instance.scale)
				vertices.push(first[0], first[1], second[0], second[1], third[0], third[1])
			}
		}

		return {
			id: this.id,
			color: colorOverride ?? this.baseColor,
			vertices: new Float32Array(vertices),
		}
	}
}

class RingArcPrimitive implements PrimitiveRenderer {
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

const createPrimitive = (command: PrimitiveCommand): PrimitiveRenderer => {
	if (command.type === 'circle') {
		return new CirclePrimitive(command)
	}

	if (command.type === 'polygon') {
		return new PolygonPrimitive(command)
	}

	return new RingArcPrimitive(command)
}

const buildPrimitiveSet = (template: PrimitiveCommand[]): PrimitiveRenderer[] => {
	const primitives = template.map((command) => createPrimitive(command))

	return primitives
}

export {
	buildPrimitiveSet,
	CirclePrimitive,
	PolygonPrimitive,
	RingArcPrimitive,
	type BuiltGeometry,
	type PrimitiveRenderer,
}
