import {type Color, type SceneInstance} from '../types'

type BuiltGeometry = {
	id: string,
	color: Color,
	vertices: Float32Array,
}

type Primitive = {
	id: string,
	baseColor: Color,
	build: (instance: SceneInstance, colorOverride?: Color) => BuiltGeometry,
}

export type {
	BuiltGeometry,
	Primitive,
}
