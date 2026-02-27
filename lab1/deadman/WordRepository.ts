type WordEntry = {
	word: string,
	hint: string,
}

class WordRepository {
	private entries: WordEntry[] = []

	async loadFromUrl(url: string): Promise<void> {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`Failed to load words: ${response.status}`)
		}

		const text = await response.text()
		this.entries = text
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0)
			.map(line => {
				const i = line.indexOf('|')
				if (i === -1) {
					return null
				}

				const word = line.slice(0, i).trim()
				const hint = line.slice(i + 1).trim()
				return word && hint
					? {
						word,
						hint,
					}
					: null
			})
			.filter((e): e is WordEntry => e !== null)

		if (this.entries.length === 0) {
			throw new Error('Нет слов в файле')
		}
	}

	pickRandom(): WordEntry {
		if (this.entries.length === 0) {
			throw new Error('Слова не загружены')
		}

		const entry = this.entries[Math.floor(Math.random() * this.entries.length)]
		if (!entry) {
			throw new Error('Слова не загружены')
		}

		return entry
	}
}

export {
	WordRepository,
	type WordEntry,
}
