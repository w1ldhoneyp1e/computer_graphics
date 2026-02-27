const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
const MAX_WRONG_ATTEMPTS = 7

type LetterStatus = 'correct' | 'wrong' | 'unused'

class GameModel {
	readonly word: string
	readonly hint: string

	private readonly correctLetters = new Set<string>()
	private readonly wrongLetters = new Set<string>()

	constructor(word: string, hint: string) {
		this.word = word
		this.hint = hint
	}

	getLetterStatus(letter: string): LetterStatus {
		if (this.correctLetters.has(letter)) {
			return 'correct'
		}

		if (this.wrongLetters.has(letter)) {
			return 'wrong'
		}

		return 'unused'
	}

	isLetterAlreadyChosen(letter: string): boolean {
		return this.correctLetters.has(letter) || this.wrongLetters.has(letter)
	}

	tryLetter(letter: string): void {
		if (this.isLetterAlreadyChosen(letter) || this.isGameOver()) {
			return
		}

		const upper = letter.toUpperCase()
		if (this.word.toUpperCase().includes(upper)) {
			this.correctLetters.add(upper)
		}
		else {
			this.wrongLetters.add(upper)
		}
	}

	getWrongCount(): number {
		return this.wrongLetters.size
	}

	isLost(): boolean {
		return this.getWrongCount() >= MAX_WRONG_ATTEMPTS
	}

	isWon(): boolean {
		const wordUpper = this.word.toUpperCase().replace(' ', '')
		for (let i = 0; i < wordUpper.length; i++) {
			const ch = wordUpper[i]
			if (ch !== undefined && !this.correctLetters.has(ch)) {
				return false
			}
		}

		return true
	}

	isGameOver(): boolean {
		return this.isWon() || this.isLost()
	}

	getMaskedWord(): string {
		const result: string[] = []
		for (let i = 0; i < this.word.length; i++) {
			const ch = this.word[i]
			if (ch === ' ') {
				result.push(' ')
			}
			else if (ch !== undefined && this.correctLetters.has(ch.toUpperCase())) {
				result.push(ch)
			}
			else {
				result.push('_')
			}
		}

		return result.join('')
	}
}

export {
	ALPHABET,
	MAX_WRONG_ATTEMPTS,
	GameModel,
	type LetterStatus,
}
