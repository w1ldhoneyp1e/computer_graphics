const BREW_SOUND_URL = '/potions/assets/brew.mp3'
const EXP_SOUND_URL = '/potions/assets/exp.mp3'
const TRADE_DENIED_SOUND_URL = '/potions/assets/trade_denied.mp3'

class SoundManager {
	private brewAudio: HTMLAudioElement | null = null
	private expAudio: HTMLAudioElement | null = null
	private tradeDeniedAudio: HTMLAudioElement | null = null

	constructor() {
		if (typeof window === 'undefined') {
			return
		}

		this.brewAudio = new Audio(BREW_SOUND_URL)
		this.expAudio = new Audio(EXP_SOUND_URL)
		this.tradeDeniedAudio = new Audio(TRADE_DENIED_SOUND_URL)
	}

	playBrew(): void {
		if (!this.brewAudio) {
			return
		}

		this.brewAudio.currentTime = 0
		this.brewAudio.play().catch(() => {})
	}

	playExp(): void {
		if (!this.expAudio) {
			return
		}

		this.expAudio.currentTime = 0
		this.expAudio.play().catch(() => {})
	}

	playTradeDenied(): void {
		if (!this.tradeDeniedAudio) {
			return
		}

		this.tradeDeniedAudio.currentTime = 0
		this.tradeDeniedAudio.play().catch(() => {})
	}
}

export {
	SoundManager,
}
