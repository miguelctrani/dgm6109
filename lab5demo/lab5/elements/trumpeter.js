"use strict";

/**
 * Draws a trumpeter on an SVG canvas.
 * This function draws a trumpeter playing a trumpet with musical notes.
 * 
 * @param {d3.Selection} svg - The SVG canvas to draw on
 * @param {number} xInput - The x coordinate of the vertex of the trumpeterBody as the origin point (75,70)
 * @param {number} yInput - The y coordinate of the vertex of the trumpeterBody as the origin point (75,70)
 * @param {boolean} showOrigin - True to show the origin point
 * @param {string} choice - Either "normal" or "step", determines the right leg and right feet of the trumpeter
 * @returns {d3.Selection} The SVG canvas with the drawn trumpeter
 */
function trumpeter(svg, xInput, yInput, showOrigin, choice) {

    /* Using the vertex of the trumpeterBody as the origin point(75,70) */
    let trumpeterX = xInput;
    let trumpeterY = yInput;

    /* Draw a trumpeter */
   
    /* Draw trumpeterHead color = #FFC9BF*/
    svg.append("circle")
        .attr("cx", trumpeterX)
        .attr("cy", trumpeterY - 20)
        .attr("r", 20)
        .attr("fill", "#FFC9BF");

    /* Draw trumpeterLeftLeg */
    svg.append("line")
        .attr("x1", trumpeterX)
        .attr("x2", trumpeterX)
        .attr("y1", trumpeterY + 125)
        .attr("y2", trumpeterY + 205)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpeterRightLeg */
    if (choice === "normal") {
        svg.append("line")
            .attr("x1", trumpeterX + 15)
            .attr("x2", trumpeterX + 15)
            .attr("y1", trumpeterY + 125)
            .attr("y2", trumpeterY + 205)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    
        /* Draw trumpeterRightFoot */
        svg.append("line")
            .attr("x1", trumpeterX + 15)
            .attr("x2", trumpeterX + 25)
            .attr("y1", trumpeterY + 205)
            .attr("y2", trumpeterY + 210)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    } else if (choice === "step") {
        svg.append("line")
            .attr("x1", trumpeterX + 15)
            .attr("x2", trumpeterX + 50)
            .attr("y1", trumpeterY + 125)
            .attr("y2", trumpeterY + 185)
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        svg.append("line")
            .attr("x1", trumpeterX + 50)  
            .attr("y1", trumpeterY + 185)
            .attr("x2", trumpeterX + 65)   
            .attr("y2", trumpeterY + 180) 
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    }

    /* Draw trumpeterBody color = #F7C5FA */
    svg.append("polyline")
        .attr("points", closedPolygon(trumpeterX, trumpeterY,
            trumpeterX - 35, trumpeterY + 135,
            trumpeterX, trumpeterY + 125,
            trumpeterX + 40, trumpeterY + 135))
        .attr("fill", "#e7a3e9ff");

    /* Draw trumpeterLeftFoot */
    svg.append("line")
        .attr("x1", trumpeterX)
        .attr("x2", trumpeterX + 10)
        .attr("y1", trumpeterY + 205)
        .attr("y2", trumpeterY + 210)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpeterLeftUpperArm */
    svg.append("line")
        .attr("x1", trumpeterX + 5)
        .attr("x2", trumpeterX + 40)
        .attr("y1", trumpeterY + 15)
        .attr("y2", trumpeterY + 5)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpeterLeftForearm */
    svg.append("line")
        .attr("x1", trumpeterX + 40)
        .attr("x2", trumpeterX + 30)
        .attr("y1", trumpeterY + 5)
        .attr("y2", trumpeterY - 15)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpeterRightUpperArm */
    svg.append("line")
        .attr("x1", trumpeterX + 5)
        .attr("x2", trumpeterX + 45)
        .attr("y1", trumpeterY + 20)
        .attr("y2", trumpeterY + 10)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpeterRightForearm */
    svg.append("line")
        .attr("x1", trumpeterX + 45)
        .attr("x2", trumpeterX + 55)
        .attr("y1", trumpeterY + 10)
        .attr("y2", trumpeterY - 15)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Draw trumpetbody color= #F7B325 */
    svg.append("rect")
        .attr("x", trumpeterX + 20)
        .attr("y", trumpeterY - 20)
        .attr("width", 50)
        .attr("height", 5)
        .attr("fill", "#F7B325");

    /* Draw trumpeterRightHand */
    svg.append("rect")
        .attr("x", trumpeterX + 55)
        .attr("y", trumpeterY - 20)
        .attr("width", 5)
        .attr("height", 5)
        .attr("fill", "black");

    /*Draw trumpetBell (the quadrilateral structure) color= #F7B325 */
    svg.append("polyline")
        .attr("points", closedPolygon(trumpeterX + 70, trumpeterY - 20,
            trumpeterX + 70, trumpeterY - 20,
            trumpeterX + 95, trumpeterY - 40,
            trumpeterX + 95, trumpeterY + 5,
            trumpeterX + 70, trumpeterY - 15))
        .attr("fill", "#F7B325");

    /*Draw trumpetBell (the circle structure) color= #F7B325 */
    svg.append("circle")
        .attr("cx", trumpeterX + 87.5)
        .attr("cy", trumpeterY - 17.5)
        .attr("r", 12.5)
        .attr("fill", "#F7B325");

    /* Draw the widthways note line */
    svg.append("line")
        .attr("x1", trumpeterX + 120)
        .attr("x2", trumpeterX + 135)
        .attr("y1", trumpeterY - 50)
        .attr("y2", trumpeterY - 45)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    /* Draw the left vertical note line */
    svg.append("line")
        .attr("x1", trumpeterX + 120)
        .attr("x2", trumpeterX + 120)
        .attr("y1", trumpeterY - 50)
        .attr("y2", trumpeterY - 25)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    /* Draw the right vertical note line */
    svg.append("line")
        .attr("x1", trumpeterX + 135)
        .attr("x2", trumpeterX + 135)
        .attr("y1", trumpeterY - 45)
        .attr("y2", trumpeterY - 20)
        .attr("stroke-width", 1)
        .attr("stroke", "black");

    /*Draw the left note circle  */
    svg.append("circle")
        .attr("cx", trumpeterX + 115)
        .attr("cy", trumpeterY - 25)
        .attr("r", 5)
        .attr("fill", "black");

    /*Draw the Right note circle  */
    svg.append("circle")
        .attr("cx", trumpeterX + 130)
        .attr("cy", trumpeterY - 20)
        .attr("r", 5)
        .attr("fill", "black");

    /* Draw origin point*/
    if (showOrigin) {
        svg.append("circle")
            .attr("cx", trumpeterX)
            .attr("cy", trumpeterY)
            .attr("r", 3)
            .attr("fill", "#240763ff");
    }
    
    // Return the SVG canvas with the drawn trumpeter
    return svg;
}