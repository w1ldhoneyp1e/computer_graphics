import { Color, SceneInstance } from "../types"

type BuiltGeometry = {
    id: string
    color: Color
    vertices: Float32Array
}

interface Primitive {
    id: string
    baseColor: Color
    build(instance: SceneInstance, colorOverride?: Color): BuiltGeometry
}

export type {
    BuiltGeometry,
    Primitive
}