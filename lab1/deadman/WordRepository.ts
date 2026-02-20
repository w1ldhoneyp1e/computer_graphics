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
		const lines = text.trim().split(/\r?\n/)
			.filter(line => line.trim())

		for (const line of lines) {
			const sep = line.indexOf('|')
			if (sep === -1) {
				continue
			}

			const word = line.slice(0, sep).trim()
			const hint = line.slice(sep + 1).trim()
			if (word && hint) {
				this.entries.push({
					word,
					hint,
				})
			}
		}

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
