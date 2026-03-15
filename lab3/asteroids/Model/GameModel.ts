import {
	pointInPolygon,
	polygonOverlapsPolygon,
	worldVertices,
} from '../Shared/Collision'
import {
	ANGULAR_FRICTION,
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
	THRUST_ACC,
} from '../Shared/constants'
import {
	type Asteroid,
	type AsteroidSize,
	type Bullet,
	type Input,
	type Point,
	type Ship,
} from '../Shared/types'
import {createAsteroid, spawnInitial} from './AsteroidFactory'

const SHOOT_COOLDOWN = 15

type GameState = {
	ship: Ship,
	asteroids: Asteroid[],
	bullets: Bullet[],
	score: number,
	lives: number,
	bulletId: number,
	shootCooldown: number,
	width: number,
	height: number,
}

function createShip(width: number, height: number): Ship {
	return {
		position: {
			x: width / 2,
			y: height / 2,
		},
		velocity: {
			x: 0,
			y: 0,
		},
		angle: -Math.PI / 2,
		angularVelocity: 0,
		thrust: false,
		vertices: SHIP_VERTICES,
	}
}

function initState(width: number, height: number): GameState {
	const ship = createShip(width, height)

	return {
		ship,
		asteroids: spawnInitial(width, height, INITIAL_ASTEROIDS),
		bullets: [],
		score: 0,
		lives: LIVES_MAX,
		bulletId: 0,
		shootCooldown: 0,
		width,
		height,
	}
}

function wrapPosition(p: Point, w: number, h: number): void {
	if (p.x < -50) {
		p.x += w + 100
	}
	if (p.x > w + 50) {
		p.x -= w + 100
	}
	if (p.y < -50) {
		p.y += h + 100
	}
	if (p.y > h + 50) {
		p.y -= h + 100
	}
}

function updateShip(s: Ship, w: number, h: number): void {
	s.velocity.x *= FRICTION
	s.velocity.y *= FRICTION
	s.angularVelocity *= ANGULAR_FRICTION
	s.angle += s.angularVelocity

	if (s.thrust) {
		s.velocity.x += Math.cos(s.angle) * THRUST_ACC
		s.velocity.y += Math.sin(s.angle) * THRUST_ACC
	}

	s.position.x += s.velocity.x
	s.position.y += s.velocity.y
	wrapPosition(s.position, w, h)
}

function shoot(state: GameState): void {
	state.bulletId += 1
	const s = state.ship
	const bullet: Bullet = {
		id: state.bulletId,
		position: {
			x: s.position.x + Math.cos(s.angle) * 16,
			y: s.position.y + Math.sin(s.angle) * 16,
		},
		velocity: {
			x: s.velocity.x + Math.cos(s.angle) * BULLET_SPEED,
			y: s.velocity.y + Math.sin(s.angle) * BULLET_SPEED,
		},
		ttl: BULLET_TTL,
	}
	state.bullets.push(bullet)
}

function nextSize(size: AsteroidSize): AsteroidSize | null {
	if (size === 'big') {
		return 'medium'
	}
	if (size === 'medium') {
		return 'small'
	}

	return null
}

function scoreForSize(size: AsteroidSize): number {
	switch (size) {
		case 'big': return SCORE_BIG
		case 'medium': return SCORE_MEDIUM
		case 'small': return SCORE_SMALL
	}
}

type UpdateResult = {
	state: GameState,
	gameOver: boolean,
	soundShoot: boolean,
	soundHit: boolean,
	soundDestroy: boolean,
	soundShipExplode: boolean,
}

class GameModel {
	private state: GameState

	constructor(width: number, height: number) {
		this.state = initState(width, height)
	}

	getState(): GameState {

		return this.state
	}

	step(input: Input): UpdateResult {
		const result = update(this.state, input)
		this.state = result.state

		return result
	}

	reset(): void {
		const {width, height} = this.state
		this.state = initState(width, height)
	}
}

function update(state: GameState, input: Input): UpdateResult {
	const result: UpdateResult = {
		state,
		gameOver: false,
		soundShoot: false,
		soundHit: false,
		soundDestroy: false,
		soundShipExplode: false,
	}

	const {width, height} = state
	const s = state.ship

	s.thrust = input.up
	if (input.left) {
		s.angularVelocity -= ROTATION_SPEED
	}
	if (input.right) {
		s.angularVelocity += ROTATION_SPEED
	}
	if (state.shootCooldown > 0) {
		state.shootCooldown -= 1
	}
	if (input.shoot && state.shootCooldown <= 0) {
		shoot(state)
		state.shootCooldown = SHOOT_COOLDOWN
		result.soundShoot = true
	}

	updateShip(s, width, height)

	for (const b of state.bullets) {
		b.position.x += b.velocity.x
		b.position.y += b.velocity.y
		b.ttl -= 1
	}
	state.bullets = state.bullets.filter(b => b.ttl > 0)

	const toRemoveBullets = new Set<number>()
	const toRemoveAsteroids = new Set<number>()
	const toAddAsteroids: Asteroid[] = []

	for (const b of state.bullets) {
		for (let i = 0; i < state.asteroids.length; i++) {
			const a = state.asteroids[i]
			if (!a) {
				continue
			}
			const verts = worldVertices(a)
			if (pointInPolygon(b.position, verts)) {
				toRemoveBullets.add(b.id)
				state.score += scoreForSize(a.size)
				const smaller = nextSize(a.size)
				if (smaller) {
					result.soundHit = true
					toAddAsteroids.push(createAsteroid(a.position, smaller))
					toAddAsteroids.push(createAsteroid(
						{
							x: a.position.x + 8,
							y: a.position.y,
						},
						smaller,
					))
				}
				else {
					result.soundDestroy = true
				}
				toRemoveAsteroids.add(a.id)
				break
			}
		}
	}

	state.bullets = state.bullets.filter(b => !toRemoveBullets.has(b.id))
	state.asteroids = state.asteroids.filter(a => !toRemoveAsteroids.has(a.id))
	for (const a of toAddAsteroids) {
		state.asteroids.push(a)
	}

	for (const a of state.asteroids) {
		a.position.x += a.velocity.x
		a.position.y += a.velocity.y
		a.angle += a.angularVelocity
		wrapPosition(a.position, width, height)
	}

	let hitAsteroidId: number | null = null
	for (const a of state.asteroids) {
		if (polygonOverlapsPolygon(s, a)) {
			result.soundShipExplode = true
			state.lives -= 1
			state.ship = createShip(width, height)
			hitAsteroidId = a.id
			break
		}
	}
	if (hitAsteroidId !== null) {
		const hit = state.asteroids.find(a => a.id === hitAsteroidId)
		if (hit) {
			const smaller = nextSize(hit.size)
			if (smaller) {
				state.asteroids.push(createAsteroid(hit.position, smaller))
				state.asteroids.push(createAsteroid(
					{
						x: hit.position.x + 10,
						y: hit.position.y,
					},
					smaller,
				))
			}
			state.asteroids = state.asteroids.filter(a => a.id !== hitAsteroidId)
		}
	}

	if (state.lives <= 0) {
		result.gameOver = true
	}

	return result
}

export type {GameState, UpdateResult}
export {
	GameModel,
	createShip,
	initState,
	nextSize,
	scoreForSize,
	shoot,
	update,
	updateShip,
	wrapPosition,
}
