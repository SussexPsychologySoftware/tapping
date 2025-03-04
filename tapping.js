// JS CODE -----------------------------------------
// Globals for easier access

// Canvas
let clock
let ctx
// timers
let startTime
let animationID;
// Participant vars
let pressTime
// Trial parameters (timeline vars)
let startAngle
let endAngle
let condition
// Clock parameters
const clockRadius = 140
const trialLength = 6 * 1000 // seconds to ms
// // constants
const TWO_PI = Math.PI * 2
const minDistance = (20 / 360) * TWO_PI // buffer on end angle

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

function radsToDeg(rad) {
    return (rad * 180) / Math.PI
}

function drawArc(angle){
    const center = clock.width/2
    const handLength = clockRadius-20
    ctx.beginPath()
    ctx.fillStyle = 'green'
    ctx.moveTo(center, center)
    ctx.arc(center, center, handLength, startAngle - Math.PI/2, angle - Math.PI/2)
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

function drawHand(angle, colour='black', startOffset=0, lineLength=clockRadius-20) {
    const center = clock.width / 2
    const x1 = center + Math.sin(angle) * startOffset
    const y1 = center - Math.cos(angle) * startOffset
    const x2 = x1 + Math.sin(angle) * lineLength
    const y2 = y1 - Math.cos(angle) * lineLength
    drawLine(x1, y1, x2, y2, colour)
}

function drawArrowhead(headLength, angle, circleMargin, colour, outwards=true) {
    const center = clock.width / 2
    // Using angle directly as radians
    
    // Arrow tip location
    const outlineMargin = 2
    const adjustedClockRadius = clockRadius + (outwards ? -outlineMargin : outlineMargin)
    const tipX = center + Math.sin(angle) * adjustedClockRadius
    const tipY = center - Math.cos(angle) * adjustedClockRadius
    
    // Line end location
    const lineX = center + Math.sin(angle) * circleMargin
    const lineY = center - Math.cos(angle) * circleMargin
    
    // Draw
    ctx.beginPath()
    ctx.fillStyle = colour
    ctx.moveTo(tipX, tipY)
    
    // Left side of arrowhead - subtract PI/2 (90 degrees) instead of Math.PI/2
    ctx.lineTo(
        lineX - Math.sin(angle - Math.PI/2) * headLength, 
        lineY + Math.cos(angle - Math.PI/2) * headLength
    )
    
    // Right side of arrowhead - add PI/2 (90 degrees) instead of Math.PI/2
    ctx.lineTo(
        lineX - Math.sin(angle + Math.PI/2) * headLength, 
        lineY + Math.cos(angle + Math.PI/2) * headLength
    )
    
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
    const propTrialLeft = time / trialLength
    return (propTrialLeft * TWO_PI + startAngle) % TWO_PI
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

function stopClock() {
    if (animationID) {
        cancelAnimationFrame(animationID);
        animationID = undefined;
    }
}

function animateClock() {
    drawClock();
    if (performance.now() - startTime < trialLength) {
        animationID = requestAnimationFrame(animateClock);
    } else {
        stopClock();
    }
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function startTrial(c){ // START
    clock = c
    ctx = c.getContext('2d')
    ctx.lineWidth = 5
    pressTime = undefined
    startTime = performance.now()
    drawClock()
    animationID = requestAnimationFrame(animateClock);
    document.addEventListener('keydown', keyListener)
}

function keyListener(e){
    if(e.key === ' '){
        pressTime = performance.now()-startTime
        document.removeEventListener('keydown', keyListener)
    }
}

// JSPSYCH ------------------------------
//https://github.com/jspsych/jsPsych/discussions/1690
const jsPsych = initJsPsych({
    on_trial_finish: function(data) {
        console.log(JSON.stringify(data));
    },
    on_finish: function() {
      jsPsych.data.displayData();
    }
})

function createTimelineVariables() {
    const nTrials = 10
    const timelineVars = []
    for(let i=0; i<nTrials; i++) {
        // Generate random angles in radians
        const startRads = (random(0, 359) / 360) * TWO_PI
        // Calculate end angle ensuring minimum distance
        const distanceRad = (random(Math.floor(minDistance * 100), Math.floor(TWO_PI - minDistance * 100)) / 100)
        // timeline vars
        const trialVars = {
            startAngle: startRads,
            endAngle: (startRads + distanceRad) % TWO_PI,
            condition: Math.random() >= 0.5 ? 'external': 'internal'
        }
        timelineVars.push(trialVars)
    }
    return timelineVars
}

const trial = {
    type: jsPsychCanvasKeyboardResponse,
    trial_duration: trialLength,
    response_ends_trial: false,
    stimulus: function(canvas) {
        startAngle = jsPsych.evaluateTimelineVariable('startAngle')
        endAngle = jsPsych.evaluateTimelineVariable('endAngle')
        condition = jsPsych.evaluateTimelineVariable('condition')
        startTrial(canvas);
    },
    choices: [' '],
    prompt: "<p>Press spacebar</p>",
    on_finish: function(data){
        data.pressTime = pressTime;
    }
}

const procedure = {
    timeline: [trial],
    timeline_variables: createTimelineVariables(),
    save_timeline_variables: true
}

const timeline = []
timeline.push(procedure);
jsPsych.run(timeline);