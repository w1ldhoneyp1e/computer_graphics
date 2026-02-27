type Point = {
	x: number,
	y: number,
}

type FlowerProps = {
	type: 'flower',
	center: Point,
	petalsAmount?: number,
	petalColor?: string,
	innerPetals?: {
		color?: string,
		angleOffset?: number,
	},
}

type LetterProps = {
	type: 'letter',
	letter: 'K' | 'R' | 'Ya',
	position: Point,
}

type TriangleProps = {
	type: 'triangle',
	v0: Point,
	v1: Point,
	v2: Point,
	fillColor: string,
}

type Drawable = // сделать нормально
	| (FlowerProps & {draw: (ctx: CanvasRenderingContext2D, props: FlowerProps) => void})
	| (LetterProps & {draw: (ctx: CanvasRenderingContext2D, props: LetterProps) => void})
	| (TriangleProps & {draw: (ctx: CanvasRenderingContext2D, props: TriangleProps) => void})

export type {
	Point,
	FlowerProps,
	LetterProps,
	TriangleProps,
	Drawable,
}
