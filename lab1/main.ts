import {drawCenter, drawPetal, drawStalk} from './flower'
import {drawYa, drawK, drawR} from './letters'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('2d context not available')

drawYa(ctx)
drawK(ctx)
drawR(ctx)