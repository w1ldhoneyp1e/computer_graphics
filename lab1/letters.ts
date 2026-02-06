const BLACK_COLOR = '#000000'
const WHITE_COLOR = '#ffffff'

ctx.strokeStyle = BLACK_COLOR
const PI = Math.PI

function drawYa(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(175, 150, 50, -PI/2, -PI*3/2, true)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.arc(175, 150, 25, -PI/2, -PI*3/2, true)
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

function drawK(ctx: CanvasRenderingContext2D) {
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

function drawR(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(425, 150, 50, -PI/2, -PI*3/2)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()

    ctx.beginPath()
    ctx.arc(425, 150, 25, -PI/2, -PI*3/2)
    ctx.fillStyle = WHITE_COLOR
    ctx.fill() 

    ctx.beginPath()
    ctx.rect(400, 100, 25, 200)
    ctx.fillStyle = BLACK_COLOR
    ctx.fill()
}

export {
    drawK,
    drawR,
    drawYa
}