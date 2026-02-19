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

type Drawable =
	| (FlowerProps & {draw: (ctx: CanvasRenderingContext2D, props: FlowerProps) => void})
	| (LetterProps & {draw: (ctx: CanvasRenderingContext2D, props: LetterProps) => void})

export type {
	Point,
	FlowerProps,
	LetterProps,
	Drawable,
}
