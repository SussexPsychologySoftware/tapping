// Canvas
const clock = document.getElementById('clock')
const ctx = clock.getContext('2d')
ctx.lineWidth = 5
// Trial Setup
const clockRadius = 140
const trialLength = 6 * 1000 // seconds to ms
const minDistance = 20 // degrees - should be time? must be < 180
let condition = 'external'
// Trial references
let startAngle
let startTime
let intervalID
// Participant vars
let pressTime

// ARCS ----
function drawClockOutline(){
    const center = clock.width/2
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.arc(center, center, clockRadius, 0, 2 * Math.PI)
    ctx.stroke()
}

function deg2rads(deg){
    return (deg * Math.PI) / 180
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

// HAND DRAWING HELPERS ---
function drawLine(x1,y1,x2,y2,color){
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawHand(angle, colour='black', startOffset=0, lineLength=clockRadius-20){
    const center = clock.width / 2
    const angleRads = deg2rads(angle)
    const x1 = center + Math.sin(angleRads) * startOffset
    const y1 = center - Math.cos(angleRads) * startOffset
    const x2 = x1 + Math.sin(angleRads) * lineLength
    const y2 = y1 - Math.cos(angleRads) * lineLength
    drawLine(x1,y1,x2,y2,colour)
}

function drawArrowhead(headLength, angle, circleMargin, colour, outwards=true){
    const angleRads = deg2rads(angle)
    const center = clock.width / 2
    // arrow tip location
    const outlineMargin = 2
    const adjustedClockRadius = clockRadius+ (outwards ? -outlineMargin : outlineMargin)
    const tipX = center + Math.sin(angleRads) * adjustedClockRadius
    const tipY = center - Math.cos(angleRads) * adjustedClockRadius
    // line end location
    const lineX = center + Math.sin(angleRads) * circleMargin
    const lineY = center - Math.cos(angleRads) * circleMargin
    // Draw
    ctx.beginPath()
    ctx.fillStyle = colour
    ctx.moveTo(tipX, tipY)
    ctx.lineTo(lineX-Math.sin(angleRads - Math.PI/2)*headLength, lineY+Math.cos(angleRads - Math.PI/2)*headLength)
    ctx.lineTo(lineX-Math.sin(angleRads + Math.PI/2)*headLength, lineY+Math.cos(angleRads + Math.PI/2)*headLength)
    ctx.lineTo(tipX, tipY)
    ctx.fill()
}

function drawArrow(angle, colour, outwards=true, length=0){
    // consider length an optional parameter. inwards or outwards (default) is a bool for now
    // draw line
    const headLength = 10
    let circleMargin
    if(outwards){
        circleMargin = clockRadius-(headLength*2)
        drawHand(angle, colour, 0, circleMargin)
    } else {
        circleMargin = clockRadius+(headLength*2)
        drawHand(angle, colour, circleMargin, length)
    }
    // draw arrowhead
    drawArrowhead(headLength, angle, circleMargin, colour, outwards)
}

function getAngle(time){
    const propTrialLeft = time/trialLength
    return (propTrialLeft * 360 + startAngle) % 360 //361 stops clear circle on revolution
}

// DRAW TARGET AND RESPONSE LINES ---
function drawResponse(){
    const pressAngle = getAngle(pressTime)
    drawArrow(pressAngle, 'blue')
}

function drawTarget(angle){
    drawArrow(angle, 'red', false, 30)
}

// TRIAL FUNCTIONS
function stopClock(){ // END
    if(intervalID){
        clearInterval(intervalID)
        intervalID = undefined
        setTimeout(startTrial, 500) // Inter-trial interval
    }
}

function drawClock(){ // DURING
    ctx.clearRect(0,0,clock.width,clock.height)
    drawClockOutline()
    if(condition === 'external') drawTarget(endAngle)
    const currentTime = performance.now()-startTime
    // console.log(currentTime/1000)
    const angle = getAngle(currentTime)
    drawHand(angle)
    drawArc(angle)
    if(pressTime) drawResponse()
    if(currentTime >= trialLength) stopClock()
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function startTrial(){ // START
    pressTime = undefined
    startAngle = random(0,360)
    endAngle = (startAngle+random(minDistance, 360-minDistance)) % 360
    startTime = performance.now()
    // Get 50/50 condition
    if(Math.random() >= 0.5) condition = 'external'
    else condition = 'internal'
    drawClock()
    intervalID = setInterval(drawClock, 17)
    document.addEventListener('keydown', keyListener)
}

startTrial()
function keyListener(e){
    if(e.key === ' '){
        pressTime = performance.now()-startTime
        document.removeEventListener('keydown', keyListener)
    }
}

