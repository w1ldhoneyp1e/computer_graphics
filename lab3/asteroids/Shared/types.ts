type Point = {
	x: number,
	y: number,
}

type AsteroidSize = 'big' | 'medium' | 'small'

type Ship = {
	position: Point,
	velocity: Point,
	angle: number,
	angularVelocity: number,
	thrust: boolean,
	vertices: Point[],
}

type Asteroid = {
	id: number,
	position: Point,
	velocity: Point,
	angle: number,
	angularVelocity: number,
	size: AsteroidSize,
	vertices: Point[],
}

type Bullet = {
	id: number,
	position: Point,
	velocity: Point,
	ttl: number,
}

type Input = {
	left: boolean,
	right: boolean,
	up: boolean,
	shoot: boolean,
}

type Polygon = {
	// position - центр полигона
	position: Point,
	vertices: Point[],
	angle: number,
}

export {
	type Asteroid,
	type AsteroidSize,
	type Bullet,
	type Input,
	type Ship,
	type Point,
	type Polygon,
}
