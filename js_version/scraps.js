function drawHandRotateVersion(angle) {
    const center = clock.width/2
    const handLength = clockRadius-20
    // ctx.save() // Save current state (includes transformations)
    ctx.translate(center, center); // shift canvas transform to rotate from center
    ctx.rotate(deg2rads(angle)); // rotate to draw hand
    // draw hand
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -handLength); // Draw line at 12 o'clock
    ctx.stroke();
    // restore
    ctx.translate(-center, -center); // reset rotate origin
    // ctx.restore() // Restore state
}

function drawTarget(angle){
    const headlen = 9
    const [x,y] = drawHand(angle, 'red')
    const angleRads = deg2rads(angle)
    ctx.beginPath()
    ctx.fillStyle = 'red'
    const arrowHeadX = x+Math.sin(angleRads)*(headlen*2)
    const arrowHeadY = y-Math.cos(angleRads)*(headlen*2)
    ctx.moveTo(arrowHeadX, arrowHeadY)
    ctx.lineTo(x+Math.sin(angleRads - Math.PI/2)*headlen, y-Math.cos(angleRads - Math.PI/2)*headlen)
    ctx.lineTo(x+Math.sin(angleRads + Math.PI/2)*headlen, y-Math.cos(angleRads + Math.PI/2)*headlen)
    ctx.moveTo(arrowHeadX, arrowHeadY)
    ctx.fill()
}

function calcEndAngle(startAngle){
    let randomAngle
    let distance = 0
    while(distance <= minDistance) {
        randomAngle = random(0,360)
        if(randomAngle < (startAngle+180) % 360) distance = mod(randomAngle-startAngle, 360)
        else distance = mod(startAngle-randomAngle, 360)
    }
    return randomAngle
}