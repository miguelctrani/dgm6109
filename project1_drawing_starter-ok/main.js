"use strict"
let drawingWidth = 500;
let drawingHeight = 500;

let frogTop = 75;
let frofLeft = 75;
let frogWdth = 200;
let frogHeight = 200;

// Key frog reference points
let centerX = 150;
let centerY = 130;

let frogBodyTop = 80;
let frogBodyLeft = 70;
let frogBodyWidth = 160;
let frogBodyHeight = 120;

// Eye circles
let eyeRadius = 45;
let leftEyeCx = 95;
let rightEyeCx = 205;
let eyesY = 55;

// Eye centers (pupils)
let pupilRadius = 13;
let pupilOffsetY = -5;

// Nostrils
let nostrilRadius = 7;
let leftNostrilCx = 132;
let rightNostrilCx = 168;
let nostrilCy = 105;

// Hip circles
let hipRadius = 60;
let leftHipCx = 50;
let rightHipCx = 220;
let hipCy = 170;

// Leg lines (inside)
let leftLegTopX = 100;
let leftLegTopY = 180;
let leftLegBottomX = 120;
let leftLegBottomY = 215;

let rightLegTopX = 195;
let rightLegTopY = 180;
let rightLegBottomX = 175;
let rightLegBottomY = 215;

// Toes (left and right, three each)
let toeRadius = 10;
let toeY = 230;
let leftToesX = [60, 80, 100];
let rightToesX = [200, 220, 240];

//Main "body" box variables
let bodyTopY = frogTop = 75;
let bodyBottomY = frogTop


/*  Variable that enables you to "talk to" your SVG drawing canvas. */
let drawing = d3.select("#canvas")
    .append("svg")
    .attr("width", 500)
    .attr("height", 500);

/* Draw a border that matches the maximum drawing area for this assignment.
    Assign the border to a variable so that:
        (1) We know what the purpose of the shape is, and
        (2) We will have the ability to change it later (in a future assignment)
*/
let border = drawing.append("rect")
    .attr("width", 500)
    .attr("height", 500)
    .attr("fill", "none")
    .attr("stroke", "blue");

/* Write your code for Project 1 beneath this comment */

//Frog body rectangle
drawing.append("rect")
    .attr("x", 100)
    .attr("y", 50)
    .attr("width", 150)
    .attr("height", 150)
    .attr("fill", "none")
    .attr("stroke", "black")

// Eyes
drawing.append("circle")
    .attr("cx", 210)
    .attr("cy", 50)
    .attr("r", 10)
    .attr("fill", "none")
    .attr("stroke", "black");

drawing.append("circle")
    .attr("cx", 210)
    .attr("cy", 50)
    .attr("r", 40)
    .attr("fill", "none")
    .attr("stroke", "black");
//Pupils
drawing.append("circle")
    .attr("cx", 140)
    .attr("cy", 50)
    .attr("r",40)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 210)
    .attr("cy", 50)
    .attr("r", 10)
    .attr("fill", "none")
    .attr("stroke", "black");
//Nostrils
drawing.append("circle")
    .attr("cx", 160)
    .attr("cy", 100)
    .attr("r", 6)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 190)
    .atrr("cy", 150)
    .attr("r", 6)
    .attr("fill", "red")
    .attr("stroke", "black")
// Hips/cheeks
drawing.append("circle")
    .attr("cx", 70)
    .attr("cy", 165)
    .attr("r", 55)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 230)
    .attr("cy", 165)
    .attr("fill", "none")
    .atrr("stroke", "black")
//Inner leg lines
drawing.append("line")
    .attr("cx", 120)
    .attr("cy", 160)
    .attr("cx2", 110)
    .attr("cy2", 220)
    .attr("stroke", "black");
drawing.append("line")
    .attr("cx", 200)
    .attr("y1", 160)
    .attr("x2", 190)
    .attr("y2", 220)
    .attr("stroke", "black");
drawing.append("line")
    .attr("x1", 220)
    .attr("y1", 160)
    .attr("x2", 220)
    .attr("y2", 220)
    .attr("stroke", "black");
    // Toes left
drawing.append("circle")
    .attr("cx", 70)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 90)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 110)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");
// Toes right
drawing.append("circle")
    .attr("cx", 190)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 210)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");
drawing.append("circle")
    .attr("cx", 230)
    .attr("cy", 240)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", "black");


