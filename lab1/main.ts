const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')
if (!ctx) throw new Error('2d context not available')

const w = canvas.width
const h = canvas.height

const BLACK_COLOR = '#000000'
const WHITE_COLOR = '#ffffff'

ctx.strokeStyle = BLACK_COLOR
ctx.lineWidth = 2

function drawYa() {
    if (!ctx) throw new Error('2d context not available')

    ctx.beginPath()
    ctx.rect(100, 100, 100, 100)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.rect(125, 125, 50, 50)
    ctx.fillStyle = WHITE_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.rect(200, 100, -25, 200)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(175, 175)
    ctx.lineTo(100, 300)
    ctx.lineTo(125, 300)
    ctx.lineTo(175, 300 - (125 / 75 * 50))
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()
}

function drawK() {
    if (!ctx) throw new Error('2d context not available')

    ctx.beginPath()
    ctx.rect(250, 100, 25, 200)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(275, 175)
    ctx.lineTo(325, 100)
    ctx.lineTo(350, 100)
    const yCenterOfK = 75 / 50 * 75 + 100
    ctx.lineTo(275, yCenterOfK)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(275, yCenterOfK - 40)
    ctx.lineTo(350, 300)
    ctx.lineTo(325, 300)
    ctx.lineTo(275, 300 - (300 - yCenterOfK + 40) / 75 * 50)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()
}

function drawR() {
    if (!ctx) throw new Error('2d context not available')

    ctx.beginPath()
    ctx.rect(400, 100, 100, 100)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.rect(425, 125, 50, 50)
    ctx.fillStyle = WHITE_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.rect(400, 100, 25, 200)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()
}

drawYa()
drawK()
drawR()
