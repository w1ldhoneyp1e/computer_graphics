import {type Input} from '../Shared/types'

class InputManager {
	readonly state: Input = {
		left: false,
		right: false,
		up: false,
		shoot: false,
	}

	bind(): () => void {
		const key = (e: KeyboardEvent) => {
			const down = e.type === 'keydown'
			switch (e.code) {
				case 'ArrowLeft':
					this.state.left = down
					e.preventDefault()
					break
				case 'ArrowRight':
					this.state.right = down
					e.preventDefault()
					break
				case 'ArrowUp':
					this.state.up = down
					e.preventDefault()
					break
				case 'Space':
					this.state.shoot = down
					e.preventDefault()
					break
			}
		}

		window.addEventListener('keydown', key)
		window.addEventListener('keyup', key)

		return () => {
			window.removeEventListener('keydown', key)
			window.removeEventListener('keyup', key)
		}
	}
}

export {
	InputManager,
	type Input,
}
