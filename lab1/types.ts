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

type DrawableProps = FlowerProps | LetterProps
type Drawable = DrawableProps & {
	draw: (ctx: CanvasRenderingContext2D, props: DrawableProps) => void,
}

export type {
	Point,
	FlowerProps,
	LetterProps,
	Drawable,
}
