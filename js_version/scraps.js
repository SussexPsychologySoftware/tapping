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