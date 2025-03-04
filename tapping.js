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
const minDistance = 20 // buffer around starting angle of timer

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
    const center = clock.width / 2
    const angleRads = deg2rads(angle)
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

function createTimelineVariables(){
    const nTrials = 10
    const timelineVars = []
    for(let i=0; i<nTrials; i++){
        const startAngle = random(0,360)

        const trialVars = {
            startAngle: startAngle,
            endAngle: (startAngle+random(minDistance, 360-minDistance)) % 360,
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