// setup
const clock = document.getElementById('clock')
const ctx = clock.getContext('2d')
ctx.lineWidth = 5
const clockRadius = 140
const trialLength = 6 * 1000 // seconds to ms
// Trial globals
let startAngle
let startTime
let intervalID

function drawClockOutline(){
    const center = clock.width/2
    ctx.beginPath()
    ctx.arc(center, center, clockRadius, 0, 2 * Math.PI)
    ctx.stroke()
}

function getAngle(currentTime){
    const trialTime = currentTime - startTime
    const propTrialLeft = trialTime/trialLength
    console.log(trialTime/1000)
    return propTrialLeft * 360 - startAngle
}

function deg2rads(deg){
    return (deg * Math.PI) / 180
}

function drawHand(angle) {
    const center = clock.width / 2
    const handLength = clockRadius-20
    const x = center + Math.sin(deg2rads(angle)) * handLength
    const y = center - Math.cos(deg2rads(angle)) * handLength
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(x, y)
    ctx.stroke()
}

function drawArc(angle){
    const center = clock.width/2
    const handLength = clockRadius-20
    ctx.beginPath()
    ctx.fillStyle = 'green'
    ctx.moveTo(center, center)
    ctx.arc(center, center, handLength, deg2rads(-90 + startAngle), deg2rads(-90 + angle))
    ctx.lineTo(center, center)
    ctx.fill()
}
function stopClock(){
    if(intervalID){
        clearInterval(intervalID)
        intervalID = undefined
    }
}

function drawClock(){
    ctx.clearRect(0,0,clock.width,clock.height)
    drawClockOutline()
    const currentTime = performance.now()
    const angle = getAngle(currentTime)
    drawHand(angle)
    drawArc(angle)
    if(currentTime > trialLength) stopClock() // stops just short?
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function startTrial(){
    startAngle = random(0,360)
    startTime = performance.now()
    intervalID = setInterval(drawClock, 20)
}

function keyListener(e){
    if(e.key === ' ') stopClock()
}

startTrial()
document.addEventListener('keydown', keyListener)
