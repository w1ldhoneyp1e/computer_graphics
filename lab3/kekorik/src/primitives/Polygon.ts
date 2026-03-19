import {transformPoint} from '../math'
import {
	type Color,
	type PolygonCommand,
	type SceneInstance,
	type Vec2,
} from '../types'
import {type BuiltGeometry, type Primitive} from './Primitive'

class Polygon implements Primitive {
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
			const firstPoint = this.points[0]!

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

export {
	Polygon,
}
