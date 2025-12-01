"use strict";

/**
 * Draws a frog on an SVG canvas.
 * The frog consists of a body, eyes, nostrils, legs, feet, and a mouth that can be open or closed.
 * 
 * @param {d3.Selection} svg - The D3 selection of the SVG element to draw on
 * @param {number} x - The horizontal coordinate for the center of the frog's body (origin point)
 * @param {number} y - The vertical coordinate for the center of the frog's body (origin point)
 * @param {boolean} showOrigin - If true, displays a pink circle at the origin point
 * @param {string} choice - Either "closed" (closed mouth) or "open" (mouth with tongue)
 * @returns {d3.Selection} The SVG element with the frog drawn on it
 */
function frog(svg, x, y, showOrigin, choice) {
    
    /* Using the center of the frog's body as the origin point */
    let frogX = x;
    let frogY = y;
    
    /* Left Hip/Leg circle */
    svg.append("circle")
        .attr("cx", frogX - 95)
        .attr("cy", frogY + 160)
        .attr("r", 50)
        .attr("fill", "Green")
        .attr("stroke", "black");

    /* Right Hip/Leg circle */
    svg.append("circle")
        .attr("cx", frogX + 100)
        .attr("cy", frogY + 160)
        .attr("r", 50)
        .attr("fill", "Green")
        .attr("stroke", "black");

    /* Main frog body rectangle */
    svg.append("rect")
        .attr("x", frogX - 80)
        .attr("y", frogY + 10)
        .attr("width", 165)
        .attr("height", 200)
        .attr("fill", "#68bc36")
        .attr("stroke", "black");

    /* Left Eye - outer circle */
    svg.append("circle")
        .attr("cx", frogX - 60)
        .attr("cy", frogY + 5)
        .attr("r", 40)
        .attr("fill", "Coral")
        .attr("stroke", "black");

    /* Left Eye - inner circle */
    svg.append("circle")
        .attr("cx", frogX - 60)
        .attr("cy", frogY + 5)
        .attr("r", 20)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Left Eye - pupil */
    svg.append("circle")
        .attr("cx", frogX - 60)
        .attr("cy", frogY + 5)
        .attr("r", 10)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Eye - outer circle */
    svg.append("circle")
        .attr("cx", frogX + 65)
        .attr("cy", frogY + 5)
        .attr("r", 40)
        .attr("fill", "Coral")
        .attr("stroke", "black");

    /* Right Eye - inner circle */
    svg.append("circle")
        .attr("cx", frogX + 65)
        .attr("cy", frogY + 5)
        .attr("r", 20)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Eye - pupil */
    svg.append("circle")
        .attr("cx", frogX + 65)
        .attr("cy", frogY + 5)
        .attr("r", 10)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Left Nostril */
    svg.append("circle")
        .attr("cx", frogX - 20)
        .attr("cy", frogY + 50)
        .attr("r", 7)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Nostril */
    svg.append("circle")
        .attr("cx", frogX + 25)
        .attr("cy", frogY + 50)
        .attr("r", 7)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Conditional mouth drawing based on choice parameter */
    if (choice === "closed") {
        /* Mouth Closed - simple line */
        svg.append("line")
            .attr("x1", frogX - 20)
            .attr("y1", frogY + 85)
            .attr("x2", frogX + 25)
            .attr("y2", frogY + 85)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
            
    } else if (choice === "open") {
        /* Mouth Open - red cavity */
        svg.append("ellipse")
            .attr("cx", frogX + 2.5)
            .attr("cy", frogY + 90)
            .attr("rx", 30)
            .attr("ry", 15)
            .attr("fill", "#ff6b6b")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        /* Tongue sticking out */
        svg.append("rect")
            .attr("x", frogX + 20)
            .attr("y", frogY + 85)
            .attr("width", 35)
            .attr("height", 8)
            .attr("fill", "#ff9999")
            .attr("stroke", "#cc6666")
            .attr("stroke-width", 1);
            
        /* Tongue tip */
        svg.append("ellipse")
            .attr("cx", frogX + 55)
            .attr("cy", frogY + 89)
            .attr("rx", 5)
            .attr("ry", 4)
            .attr("fill", "#ff9999")
            .attr("stroke", "#cc6666")
            .attr("stroke-width", 1);
    }

    /* Left leg - teal polygon */
    svg.append("polygon")
        .attr("points", 
            (frogX - 45) + "," + (frogY + 165) + " " +
            (frogX - 30) + "," + (frogY + 165) + " " +
            (frogX - 5) + "," + (frogY + 220) + " " +
            (frogX - 15) + "," + (frogY + 220))
        .attr("fill", "teal")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Right leg - teal polygon */
    svg.append("polygon")
        .attr("points",
            (frogX + 35) + "," + (frogY + 165) + " " +
            (frogX + 50) + "," + (frogY + 165) + " " +
            (frogX + 20) + "," + (frogY + 220) + " " +
            (frogX + 10) + "," + (frogY + 220))
        .attr("fill", "teal")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Left Foot - Toe 1 */
    svg.append("circle")
        .attr("cx", frogX - 107)
        .attr("cy", frogY + 218)
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 2 */
    svg.append("circle")
        .attr("cx", frogX - 90)
        .attr("cy", frogY + 218)
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 3 */
    svg.append("circle")
        .attr("cx", frogX - 7)
        .attr("cy", frogY + 220)
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 4 */
    svg.append("circle")
        .attr("cx", frogX - 24)
        .attr("cy", frogY + 220)
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 1 */
    svg.append("circle")
        .attr("cx", frogX + 15)
        .attr("cy", frogY + 220)
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 2 */
    svg.append("circle")
        .attr("cx", frogX + 95)
        .attr("cy", frogY + 218)
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 3 */
    svg.append("circle")
        .attr("cx", frogX + 112)
        .attr("cy", frogY + 218)
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 4 */
    svg.append("circle")
        .attr("cx", frogX + 30)
        .attr("cy", frogY + 220)
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Draw origin point if requested */
    if (showOrigin === true) {
        svg.append("circle")
            .attr("cx", frogX)
            .attr("cy", frogY)
            .attr("r", 3)
            .attr("fill", "deeppink");
    }
    
    /* Return the SVG canvas */
    return svg;
}

