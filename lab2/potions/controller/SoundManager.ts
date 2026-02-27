const CREATION_SOUND_URL = '/potions/assets/creation.mp3'
const EXPLORING_SOUND_URL = '/potions/assets/exploring.mp3'

class SoundManager {
	private creationAudio: HTMLAudioElement | null = null
	private exploringAudio: HTMLAudioElement | null = null

	constructor() {
		if (typeof window === 'undefined') {
			return
		}

		this.creationAudio = new Audio(CREATION_SOUND_URL)
		this.exploringAudio = new Audio(EXPLORING_SOUND_URL)
	}

	playNewCombination(): void {
		this.playExploring()
	}

	playElementCreation(): void {
		this.playCreation()
	}

	private playCreation(): void {
		if (!this.creationAudio) {
			return
		}

		this.creationAudio.currentTime = 0
		this.creationAudio.play().catch(() => {})
	}

	private playExploring(): void {
		if (!this.exploringAudio) {
			return
		}

		this.exploringAudio.currentTime = 0
		this.exploringAudio.play().catch(() => {})
	}
}

export {
	SoundManager,
}
