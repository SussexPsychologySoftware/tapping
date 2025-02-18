// Canvas
const clock = document.getElementById('clock')
const ctx = clock.getContext('2d')
ctx.lineWidth = 5
// Trial Setup
const clockRadius = 140
const trialLength = 6 * 1000 // seconds to ms
const minDistance = 120 // degrees - should be time? must be < 180
const maxDistance = 350
let condition = 'external'
// Trial references
let startAngle
let startTime
let intervalID

function drawClockOutline(){
    const center = clock.width/2
    ctx.beginPath()
    ctx.arc(center, center, clockRadius, 0, 2 * Math.PI)
    ctx.stroke()
}

function drawTarget(angle){
    const center = clock.width / 2
    const angleRads = deg2rads(angle)
    const headLength = 10
    const arrowLength = 30
    // start
    const xInner = center + Math.sin(angleRads) * (clockRadius+headLength*2)
    const yInner = center - Math.cos(angleRads) * (clockRadius+headLength*2)
    // end
    const xOuter = xInner + Math.sin(angleRads) * arrowLength
    const yOuter = yInner - Math.cos(angleRads) * arrowLength
    // draw line
    ctx.beginPath()
    ctx.strokeStyle = 'red'
    ctx.moveTo(xOuter, yOuter)
    ctx.lineTo(xInner, yInner)
    ctx.stroke()

    const circleX = center + Math.sin(angleRads) * (clockRadius+3)
    const circleY = center - Math.cos(angleRads) * (clockRadius+3)
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.moveTo(circleX, circleY)
    ctx.lineTo(xInner-Math.sin(angleRads - Math.PI/2)*headLength, yInner+Math.cos(angleRads - Math.PI/2)*headLength)
    ctx.lineTo(xInner-Math.sin(angleRads + Math.PI/2)*headLength, yInner+Math.cos(angleRads + Math.PI/2)*headLength)
    ctx.lineTo(circleX, circleY)
    ctx.fill()
}

function getAngle(time){
    const propTrialLeft = time/trialLength
    return (propTrialLeft * 360 + startAngle) % 360 //361 stops clear circle on revolution
}

function deg2rads(deg){
    return (deg * Math.PI) / 180
}

function drawHand(angle, colour='black') {
    const center = clock.width / 2
    const handLength = clockRadius-20
    const angleRads = deg2rads(angle)
    const x = center + Math.sin(angleRads) * handLength
    const y = center - Math.cos(angleRads) * handLength
    ctx.beginPath()
    ctx.strokeStyle = colour
    ctx.moveTo(center, center)
    ctx.lineTo(x, y)
    ctx.stroke()
    return [x, y]
}

function drawArc(angle){
    const center = clock.width/2
    const handLength = clockRadius-20
    ctx.beginPath()
    ctx.fillStyle = 'green'
    ctx.moveTo(center, center)
    ctx.arc(center, center, handLength, deg2rads(startAngle-90), deg2rads(angle-90))
    ctx.lineTo(center, center)
    ctx.fill()
}

function stopClock(){
    if(intervalID){
        clearInterval(intervalID)
        intervalID = undefined
        setTimeout(startTrial, 500)
    }
}

function drawClock(){
    ctx.clearRect(0,0,clock.width,clock.height)
    drawClockOutline()
    if(condition === 'external') drawTarget(endAngle)
    const currentTime = performance.now()-startTime
    // console.log(currentTime/1000)
    const angle = getAngle(currentTime)
    // console.log(angle)
    drawHand(angle)
    drawArc(angle)
    if(currentTime >= trialLength) stopClock() // stops just short?
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function calcEndAngle(startAngle) {
    // Note this isn't right - only the clockwise direction matters
    let randomAngle
    let distance = 0
    while(distance <= minDistance || distance >= maxDistance) {
        randomAngle = randomAngle = Math.floor(Math.random() * 360)
        distance = (randomAngle - startAngle + 360) % 360
    }
    return randomAngle
}

function startTrial(){
    startAngle = random(0,360)
    endAngle = calcEndAngle(startAngle)
    startTime = performance.now()
    // Get 50/50 condition
    if(Math.random() >= 0.5) condition = 'external'
    else condition = 'internal'
    drawClock()
    intervalID = setInterval(drawClock, 17)
}

function keyListener(e){
    if(e.key === ' ') stopClock()
}

startTrial()
document.addEventListener('keydown', keyListener)
