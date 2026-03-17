import {pointInPolygon, polygonOverlapsPolygon} from '../Shared/collision'
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
import {worldVertices} from '../Shared/utils'
import {createAsteroid, spawnInitial} from './AsteroidFactory'

const SHOOT_COOLDOWN = 15

type GameState = {
	ship: Ship,
	asteroids: Asteroid[],
	bullets: Bullet[],
	score: number,
	lives: number,
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
	private lastBulletId = 0
	private shootCooldown = 0
	private width: number
	private height: number

	constructor(width: number, height: number) {
		this.state = this.initState()
		this.width = width
		this.height = height
	}

	getState(): GameState {

		return this.state
	}

	step(input: Input): UpdateResult {
		const result = this.update(this.state, input)
		this.state = result.state

		return result
	}

	reset(): void {
		this.state = this.initState()
	}

	private createShip(): Ship {
		return {
			position: {
				x: this.width / 2,
				y: this.height / 2,
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

	private initState(): GameState {
		const ship = this.createShip()

		return {
			ship,
			asteroids: spawnInitial(this.width, this.height, INITIAL_ASTEROIDS),
			bullets: [],
			score: 0,
			lives: LIVES_MAX,
		}
	}

	private wrapPosition(p: Point, w: number, h: number): void {
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

	private updateShip(s: Ship, w: number, h: number): void {
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
		this.wrapPosition(s.position, w, h)
	}

	private shoot(state: GameState): void {
		this.lastBulletId += 1
		const s = state.ship
		const bullet: Bullet = {
			id: this.lastBulletId,
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

	private nextSize(size: AsteroidSize): AsteroidSize | null {
		if (size === 'big') {
			return 'medium'
		}
		if (size === 'medium') {
			return 'small'
		}

		return null
	}

	private scoreForSize(size: AsteroidSize): number {
		switch (size) {
			case 'big': return SCORE_BIG
			case 'medium': return SCORE_MEDIUM
			case 'small': return SCORE_SMALL
		}
	}

	private handleInput(state: GameState, input: Input, result: UpdateResult): void {
		const s = state.ship

		s.thrust = input.up
		if (input.left) {
			s.angularVelocity -= ROTATION_SPEED
		}
		if (input.right) {
			s.angularVelocity += ROTATION_SPEED
		}
		if (this.shootCooldown > 0) {
			this.shootCooldown -= 1
		}
		if (input.shoot && this.shootCooldown <= 0) {
			this.shoot(state)
			this.shootCooldown = SHOOT_COOLDOWN
			result.soundShoot = true
		}
	}

	private updateBullets(state: GameState): void {
		for (const b of state.bullets) {
			b.position.x += b.velocity.x
			b.position.y += b.velocity.y
			b.ttl -= 1
		}
		state.bullets = state.bullets.filter(b => b.ttl > 0)
	}

	private handleBulletAsteroidCollisions(state: GameState, result: UpdateResult): void {
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
				if (!pointInPolygon(b.position, verts)) {
					continue
				}
				toRemoveBullets.add(b.id)
				state.score += this.scoreForSize(a.size)
				const smaller = this.nextSize(a.size)
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

		state.bullets = state.bullets.filter(b => !toRemoveBullets.has(b.id))
		state.asteroids = state.asteroids.filter(a => !toRemoveAsteroids.has(a.id))
		for (const a of toAddAsteroids) {
			state.asteroids.push(a)
		}
	}

	private updateAsteroids(state: GameState): void {
		const {width, height} = this

		for (const a of state.asteroids) {
			a.position.x += a.velocity.x
			a.position.y += a.velocity.y
			a.angle += a.angularVelocity
			this.wrapPosition(a.position, width, height)
		}
	}

	private handleShipAsteroidCollisions(state: GameState, result: UpdateResult): void {
		const s = state.ship

		let hitAsteroidId: number | null = null
		for (const a of state.asteroids) {
			if (polygonOverlapsPolygon(s, a)) {
				result.soundShipExplode = true
				state.lives -= 1
				state.ship = this.createShip()
				hitAsteroidId = a.id
				break
			}
		}
		if (hitAsteroidId === null) {
			return
		}
		const hit = state.asteroids.find(a => a.id === hitAsteroidId)
		if (!hit) {
			return
		}
		const smaller = this.nextSize(hit.size)
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

	private update(state: GameState, input: Input): UpdateResult {
		const result: UpdateResult = {
			state,
			gameOver: false,
			soundShoot: false,
			soundHit: false,
			soundDestroy: false,
			soundShipExplode: false,
		}

		const {width, height} = this
		const shipState = state.ship

		this.handleInput(state, input, result)
		this.updateShip(shipState, width, height)
		this.updateBullets(state)
		this.handleBulletAsteroidCollisions(state, result)
		this.updateAsteroids(state)
		this.handleShipAsteroidCollisions(state, result)

		if (state.lives <= 0) {
			result.gameOver = true
		}

		return result
	}
}

export type {GameState, UpdateResult}
export {
	GameModel,
}
