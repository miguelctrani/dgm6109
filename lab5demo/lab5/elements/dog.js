"use strict";

/**
 * Draws a dog shape on a given D3 drawing area.
 * The dog is composed of several polylines and circles representing its head,
 * body, ears, tail, and facial features.
 * 
 * @param {d3.Selection} svg The D3 selection of the SVG element to draw in.
 * @param {number} x The horizontal coordinate for the origin of the dog svg.
 * @param {number} y The vertical coordinate for the origin of the dog svg.
 * @param {boolean} showOrigin A boolean flag to determine if the origin point should be drawn.
 * @returns {d3.Selection} The D3 selection of the SVG element, now with the dog drawn on it.
 */
function drawDog(svg, x, y, showOrigin) {

    // Head Coordinates
    let headUpperLeftX = 50 + x;
    let headUpperLeftY = 100 + y;
    let headUpperRightX = 155 + x;
    let headUpperRightY = 50 + y;
    let headLowerLeftX = headUpperLeftX + 50;
    let headLowerLeftY = headUpperLeftY + 25;
    let headLowerRightX = headUpperRightX - 5;
    let headLowerRightY = headUpperRightY + 50;

    // Draw the dog's head
    svg.append("polyline")
        .attr("points", closedPolygon(headUpperLeftX, headUpperLeftY,
                                    headUpperRightX, headUpperRightY,
                                    headLowerRightX, headLowerRightY,
                                    headLowerLeftX, headLowerLeftY))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "lightgrey");

    // Draw the dog's left ear
    svg.append("polyline")
        .attr("points", closedPolygon(headUpperLeftX, headUpperLeftY,
                                    headUpperLeftX - 25, headUpperLeftY + 75,
                                    headUpperLeftX + 25, headUpperLeftY + 75))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "darkgrey");

    // Draw the dog's right ear
    svg.append("polyline")
        .attr("points", closedPolygon(headUpperRightX, headUpperRightY,
                                    headUpperRightX + 75, headUpperRightY - 25,
                                    headUpperRightX + 75, headUpperRightY + 25))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "lightgrey");
    
    // Body coordinates
    let bodyTopX = 125 + x;
    let bodyTopY = 135 + y;
    let bodyLowerLeftX = 75 + x;
    let bodyLowerY = 300 + y;
    let bodyLowerRightX = 175 + x;
    
    // Draw the dog's main body
    svg.append("polyline")
        .attr("points", closedPolygon(bodyTopX, bodyTopY,
                                    bodyLowerLeftX, bodyLowerY,
                                    bodyLowerRightX, bodyLowerY))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "lightgrey");
    
    // Draw the inner triangle on the body
    let innerBodyP1_X = (bodyTopX + bodyLowerLeftX) / 2;
    let innerBodyP1_Y = (bodyTopY + bodyLowerY) / 2;
    let innerBodyP2_X = (bodyTopX + bodyLowerRightX) / 2;
    let innerBodyP2_Y = (bodyTopY + bodyLowerY) / 2;
    let innerBodyP3_X = (bodyLowerLeftX + bodyLowerRightX) / 2;
    let innerBodyP3_Y = bodyLowerY;

    svg.append("polyline")
        .attr("points", closedPolygon(innerBodyP1_X, innerBodyP1_Y,
                                    innerBodyP2_X, innerBodyP2_Y,
                                    innerBodyP3_X, innerBodyP3_Y))
        .attr("fill", "darkgrey")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    
    // Draw the dog's tail
    svg.append("polyline")
        .attr("points", closedPolygon(bodyLowerLeftX, bodyLowerY,
                                    bodyLowerLeftX - 50, bodyLowerY,
                                    bodyLowerLeftX - 50, bodyLowerY - 50))
        .attr("fill", "darkgrey")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Feet coordinates
    let feetLineY = bodyLowerY;
    let firstFootX = (innerBodyP3_X + bodyLowerLeftX) / 2;
    
    // Draw the nails
    svg.append("line").attr("x1", firstFootX - 5).attr("y1", feetLineY).attr("x2", firstFootX - 10).attr("y2", feetLineY - 10).attr("stroke", "black").attr("stroke-width", 2);
    svg.append("line").attr("x1", firstFootX + 10).attr("y1", feetLineY).attr("x2", firstFootX + 5).attr("y2", feetLineY - 10).attr("stroke", "black").attr("stroke-width", 2);
    svg.append("line").attr("x1", firstFootX + 40).attr("y1", feetLineY).attr("x2", firstFootX + 45).attr("y2", feetLineY - 10).attr("stroke", "black").attr("stroke-width", 2);
    svg.append("line").attr("x1", firstFootX + 55).attr("y1", feetLineY).attr("x2", firstFootX + 60).attr("y2", feetLineY - 10).attr("stroke", "black").attr("stroke-width", 2);
    
    // Mouth and Face
    let noseTipX = headLowerRightX + 20;
    let noseTipY = headLowerRightY + 85;

    // Draw the dog's mouth area
    svg.append("polyline")
        .attr("points", closedPolygon(headLowerLeftX, headLowerLeftY,
                                    headLowerRightX, headLowerRightY,
                                    noseTipX, noseTipY))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "darkgrey");

    // Draw the dog's nose
    svg.append("circle")
        .attr("cx", noseTipX)
        .attr("cy", noseTipY)
        .attr("r", 5)
        .attr("fill", "black");

    // Draw the dog's eyes
    svg.append("circle")
        .attr("cx", noseTipX - 65)
        .attr("cy", noseTipY - 80)
        .attr("r", 5)
        .attr("fill", "black");

    svg.append("circle")
        .attr("cx", noseTipX - 35)
        .attr("cy", noseTipY - 90)
        .attr("r", 5)
        .attr("fill", "black");

    // Conditionally draw the origin point
    if (showOrigin === true) {
        svg.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 3)
            .attr("fill", "deeppink");
    }
    
    return svg;
}