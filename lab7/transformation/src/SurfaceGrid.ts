import {type SurfaceGrid} from './types'

type SurfaceGridArgs = {
	uSegments: number,
	vSegments: number,
}

class SurfaceGridFactory {
	static create({uSegments, vSegments}: SurfaceGridArgs): SurfaceGrid {
		const vertices: number[] = []
		const lineIndices: number[] = []
		const triangleIndices: number[] = []
		const index = (uIndex: number, vIndex: number): number => uIndex * (vSegments + 1) + vIndex

		for (let i = 0; i <= uSegments; i++) {
			for (let j = 0; j <= vSegments; j++) {
				vertices.push(i / uSegments, j / vSegments, 0)
			}
		}

		for (let i = 0; i <= uSegments; i++) {
			for (let j = 0; j <= vSegments; j++) {
				const current = index(i, j)
				if (i < uSegments) {
					lineIndices.push(current, index(i + 1, j))
				}

				if (j < vSegments) {
					lineIndices.push(current, index(i, j + 1))
				}
			}
		}

		for (let i = 0; i < uSegments; i++) {
			for (let j = 0; j < vSegments; j++) {
				const a = index(i, j)
				const b = index(i + 1, j)
				const c = index(i, j + 1)
				const d = index(i + 1, j + 1)
				triangleIndices.push(a, c, b, b, c, d)
			}
		}

		return {
			vertices: new Float32Array(vertices),
			lineIndices: new Uint16Array(lineIndices),
			triangleIndices: new Uint16Array(triangleIndices),
		}
	}
}

export {
	SurfaceGridFactory,
}
