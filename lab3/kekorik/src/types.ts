type Vec2 = [number, number]
type Color = [number, number, number, number]

type CircleCommand = {
	id: string,
	type: 'circle',
	color: Color,
	center: Vec2,
	radius: number,
	segments?: number,
}

type PolygonCommand = {
	id: string,
	type: 'polygon',
	color: Color,
	points: Vec2[],
}

type RingArcCommand = {
	id: string,
	type: 'ringArc',
	color: Color,
	center: Vec2,
	innerRadius: number,
	outerRadius: number,
	startAngle: number,
	endAngle: number,
	segments?: number,
}

type PrimitiveCommand = CircleCommand | PolygonCommand | RingArcCommand

type SceneInstance = {
	position: Vec2,
}

type SceneData = {
	background: Color,
	template: PrimitiveCommand[],
	instances: SceneInstance[],
}

type ViewBounds = {
	left: number,
	right: number,
	bottom: number,
	top: number,
}

type DragState = {
	instanceIndex: number,
	offset: Vec2,
}

export type {
	Color,
	CircleCommand,
	DragState,
	PolygonCommand,
	PrimitiveCommand,
	RingArcCommand,
	SceneData,
	SceneInstance,
	Vec2,
	ViewBounds,
}
