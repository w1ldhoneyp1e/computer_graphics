const SOUNDS = {
	shoot: '/sounds/shoot.wav',
	hit: '/sounds/hit.wav',
	destroy: '/sounds/destroy.wav',
	shipExplode: '/sounds/ship_explode.wav',
} as const

class SoundManager {
	private readonly cache = new Map<string, HTMLAudioElement>()

	private play(url: string): void {
		if (typeof window === 'undefined') {
			return
		}
		let audio = this.cache.get(url)
		if (!audio) {
			audio = new Audio(url)
			this.cache.set(url, audio)
		}
		audio.currentTime = 0
		audio.play().catch(() => {})
	}

	playShoot(): void {
		this.play(SOUNDS.shoot)
	}

	playHit(): void {
		this.play(SOUNDS.hit)
	}

	playDestroy(): void {
		this.play(SOUNDS.destroy)
	}

	playShipExplode(): void {
		this.play(SOUNDS.shipExplode)
	}
}

export {
	SoundManager,
	SOUNDS,
}
