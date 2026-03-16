import {type Point} from './types'

const LIVES_MAX = 3
const FRICTION = 0.99
const ANGULAR_FRICTION = 0.97
const THRUST_ACC = 0.03
const ROTATION_SPEED = 0.004
const BULLET_SPEED = 12
const BULLET_TTL = 60
const ASTEROID_BIG_RADIUS = 40
const ASTEROID_MEDIUM_RADIUS = 24
const ASTEROID_SMALL_RADIUS = 12
const ASTEROID_SPEED_MAX = 1.2
const ASTEROID_ANGLES = 10
const SCORE_BIG = 20
const SCORE_MEDIUM = 50
const SCORE_SMALL = 100
const INITIAL_ASTEROIDS = 4
const SHIP_VERTICES: Point[] = [
	{
		x: 30,
		y: 0,
	},
	{
		x: 15,
		y: 10,
	},
	{
		x: 0,
		y: 5,
	},
	{
		x: -10,
		y: 10,
	},
	{
		x: -10,
		y: -10,
	},
	{
		x: 0,
		y: -5,
	},
	{
		x: 15,
		y: -10,
	},
	{
		x: 30,
		y: 0,
	},
]
const SHIP_FLAME_VERTICES: Point[] = [
	{
		x: 0,
		y: -5,
	},
	{
		x: -5,
		y: -5,
	},
	{
		x: 0,
		y: 0,
	},
	{
		x: 0,
		y: 5,
	},
	{
		x: 5,
		y: 5,
	},
	{
		x: 0,
		y: 0,
	},
]
const BULLET_VERTICES: Point[] = [
	{
		x: -2,
		y: -2,
	},
	{
		x: 2,
		y: -2,
	},
	{
		x: 0,
		y: 2,
	},
]

export {
	ANGULAR_FRICTION,
	ASTEROID_ANGLES,
	ASTEROID_BIG_RADIUS,
	ASTEROID_MEDIUM_RADIUS,
	ASTEROID_SMALL_RADIUS,
	ASTEROID_SPEED_MAX,
	BULLET_SPEED,
	BULLET_TTL,
	FRICTION,
	INITIAL_ASTEROIDS,
	LIVES_MAX,
	ROTATION_SPEED,
	SCORE_BIG,
	SCORE_MEDIUM,
	SCORE_SMALL,
	SHIP_VERTICES,
	SHIP_FLAME_VERTICES,
	BULLET_VERTICES,
	THRUST_ACC,
}
