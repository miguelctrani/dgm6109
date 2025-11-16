"use strict"

/* Variable that enables you to "talk to" your SVG drawing canvas. */
let drawing = d3.select("#canvas")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);

/* Draw a border that matches the maximum drawing area for this assignment. */
let border = drawing.append("rect")
    .attr("width", 500)
    .attr("height", 500)
    .attr("fill", "none")
    .attr("stroke", "red");

/* ========== FROG DRAWING #11 - Miguel Chavez ========== */

/* Left Eye - outer circle */
let leftEyeOuter = drawing.append("circle")
    .attr("cx", 165)
    .attr("cy", 230)
    .attr("r", 40)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Eye - inner circle */
let leftEyeInner = drawing.append("circle")
    .attr("cx", 165)
    .attr("cy", 230)
    .attr("r", 20)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Eye - pupil (filled black) */
let leftPupil = drawing.append("circle")
    .attr("cx", 165)
    .attr("cy", 230)
    .attr("r", 10)
    .attr("fill", "black")
    .attr("stroke", "black");

/* Right Eye - outer circle */
let rightEyeOuter = drawing.append("circle")
    .attr("cx", 290)
    .attr("cy", 230)
    .attr("r", 40)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Eye - inner circle */
let rightEyeInner = drawing.append("circle")
    .attr("cx", 290)
    .attr("cy", 230)
    .attr("r", 20)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Eye - pupil (filled black) */
let rightPupil = drawing.append("circle")
    .attr("cx", 290)
    .attr("cy", 230)
    .attr("r", 10)
    .attr("fill", "black")
    .attr("stroke", "black");

/* Main frog body rectangle */
let frogBody = drawing.append("rect")
    .attr("x", 145)
    .attr("y", 235)
    .attr("width", 165)
    .attr("height", 200)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Nostril */
let leftNostril = drawing.append("circle")
    .attr("cx", 205)
    .attr("cy", 275)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Nostril */
let rightNostril = drawing.append("circle")
    .attr("cx", 250)
    .attr("cy", 275)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Hip/Leg circle */
let leftHip = drawing.append("circle")
    .attr("cx", 130)
    .attr("cy", 385)
    .attr("r", 50)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Hip/Leg circle */
let rightHip = drawing.append("circle")
    .attr("cx", 325)
    .attr("cy", 385)
    .attr("r", 50)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left leg line 1 (angled inward) */
let leftLegLine1 = drawing.append("line")
    .attr("x1", 180)
    .attr("y1", 390)
    .attr("x2", 210)
    .attr("y2", 445)
    .attr("stroke", "black");

/* Left leg line 2 (also angled inward, closer to center) */
let leftLegLine2 = drawing.append("line")
    .attr("x1", 195)
    .attr("y1", 390)
    .attr("x2", 220)
    .attr("y2", 445)
    .attr("stroke", "black");

/* Left leg top connector (closes the leg at the top) */
let leftLegTop = drawing.append("line")
    .attr("x1", 180)
    .attr("y1", 390)
    .attr("x2", 195)
    .attr("y2", 390)
    .attr("stroke", "black");

/* Right leg line 1 (angled inward) */
let rightLegLine1 = drawing.append("line")
    .attr("x1", 275)
    .attr("y1", 390)
    .attr("x2", 245)
    .attr("y2", 445)
    .attr("stroke", "black");

/* Right leg line 2 (also angled inward, closer to center) */
let rightLegLine2 = drawing.append("line")
    .attr("x1", 260)
    .attr("y1", 390)
    .attr("x2", 235)
    .attr("y2", 445)
    .attr("stroke", "black");

/* Right leg top connector (closes the leg at the top) */
let rightLegTop = drawing.append("line")
    .attr("x1", 260)
    .attr("y1", 390)
    .attr("x2", 275)
    .attr("y2", 390)
    .attr("stroke", "black");

/* Left Foot - Toe 1 */
let leftToe1 = drawing.append("circle")
    .attr("cx", 118)
    .attr("cy", 443)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Foot - Toe 2 */
let leftToe2 = drawing.append("circle")
    .attr("cx", 135)
    .attr("cy", 443)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Foot - Toe 3 */
let leftToe3 = drawing.append("circle")
    .attr("cx", 218)
    .attr("cy", 445)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Left Foot - Toe 4 */
let leftToe4 = drawing.append("circle")
    .attr("cx", 201)
    .attr("cy", 445)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Foot - Toe 1 */
let rightToe1 = drawing.append("circle")
    .attr("cx", 240)
    .attr("cy", 445)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Foot - Toe 2 */
let rightToe2 = drawing.append("circle")
    .attr("cx", 320)
    .attr("cy", 443)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Foot - Toe 3 */
let rightToe3 = drawing.append("circle")
    .attr("cx", 337)
    .attr("cy", 443)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");

/* Right Foot - Toe 4 */
let rightToe4 = drawing.append("circle")
    .attr("cx", 255)
    .attr("cy", 445)
    .attr("r", 7)
    .attr("fill", "none")
    .attr("stroke", "black");