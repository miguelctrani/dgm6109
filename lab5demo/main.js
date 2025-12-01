"use strict"

// This function will be called when Draw! button is clicked
function drawImage() {
    // Clear the canvas
    d3.select("#canvas").selectAll("*").remove();
    
    // Get user input values
    let xInput = Number(document.getElementById("xInput").value);
    let yInput = Number(document.getElementById("yInput").value);
    
    // Step 5: Assign to meaningful variable names (frogX, frogY)
    let frogX = xInput;
    let frogY = yInput;
    
    // Step 9: Read the selected mouth state from the select menu
    let choice = document.getElementById("mouthState").value;
    
    // Create the SVG canvas
    let drawing = d3.select("#canvas");
    
    /* 
     * ORIGIN POINT: The frog is drawn relative to frogX, frogY which represents
     * the center of the frog's main body rectangle. When frogX and frogY change,
     * the entire frog moves together as one unit.
     */
    
    /* ========== FROG DRAWING FINAL - Miguel Chavez ========== */
    
    /* Left Hip/Leg circle */
    let leftHip = drawing.append("circle")
        .attr("cx", frogX - 95)  // 130 - 225 = -95
        .attr("cy", frogY + 160) // 385 - 225 = 160
        .attr("r", 50)
        .attr("fill", "Green")
        .attr("stroke", "black");

    /* Right Hip/Leg circle */
    let rightHip = drawing.append("circle")
        .attr("cx", frogX + 100)  // 325 - 225 = 100
        .attr("cy", frogY + 160)  // 385 - 225 = 160
        .attr("r", 50)
        .attr("fill", "Green")
        .attr("stroke", "black");

    /* Main frog body rectangle */
    let frogBody = drawing.append("rect")
        .attr("x", frogX - 80)    // 145 - 225 = -80
        .attr("y", frogY + 10)    // 235 - 225 = 10
        .attr("width", 165)
        .attr("height", 200)
        .attr("fill", "#68bc36")
        .attr("stroke", "black");

    /* Left Eye - outer circle */
    let leftEyeOuter = drawing.append("circle")
        .attr("cx", frogX - 60)   // 165 - 225 = -60
        .attr("cy", frogY + 5)    // 230 - 225 = 5
        .attr("r", 40)
        .attr("fill", "Coral")
        .attr("stroke", "black");

    /* Left Eye - inner circle */
    let leftEyeInner = drawing.append("circle")
        .attr("cx", frogX - 60)
        .attr("cy", frogY + 5)
        .attr("r", 20)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Left Eye - pupil (filled black) */
    let leftPupil = drawing.append("circle")
        .attr("cx", frogX - 60)
        .attr("cy", frogY + 5)
        .attr("r", 10)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Eye - outer circle */
    let rightEyeOuter = drawing.append("circle")
        .attr("cx", frogX + 65)   // 290 - 225 = 65
        .attr("cy", frogY + 5)    // 230 - 225 = 5
        .attr("r", 40)
        .attr("fill", "Coral")
        .attr("stroke", "black");

    /* Right Eye - inner circle */
    let rightEyeInner = drawing.append("circle")
        .attr("cx", frogX + 65)
        .attr("cy", frogY + 5)
        .attr("r", 20)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Eye - pupil (filled black) */
    let rightPupil = drawing.append("circle")
        .attr("cx", frogX + 65)
        .attr("cy", frogY + 5)
        .attr("r", 10)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Left Nostril */
    let leftNostril = drawing.append("circle")
        .attr("cx", frogX - 20)   // 205 - 225 = -20
        .attr("cy", frogY + 50)   // 275 - 225 = 50
        .attr("r", 7)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* Right Nostril */
    let rightNostril = drawing.append("circle")
        .attr("cx", frogX + 25)   // 250 - 225 = 25
        .attr("cy", frogY + 50)   // 275 - 225 = 50
        .attr("r", 7)
        .attr("fill", "black")
        .attr("stroke", "black");

    /* 
     * CONDITIONAL DRAWING: The frog's mouth changes based on user selection
     * - "closed": Simple curved line for closed mouth
     * - "open": Red open mouth cavity with pink tongue sticking out
     */
    if (choice == "closed") {
        /* Mouth Closed - simple curved line */
        let mouthClosed = drawing.append("line")
            .attr("x1", frogX - 20)
            .attr("y1", frogY + 85)
            .attr("x2", frogX + 25)
            .attr("y2", frogY + 85)
            .attr("stroke", "black")
            .attr("stroke-width", 2);
            
    } else {
        /* Mouth Open - red cavity */
        let mouthOpen = drawing.append("ellipse")
            .attr("cx", frogX + 2.5)
            .attr("cy", frogY + 90)
            .attr("rx", 30)
            .attr("ry", 15)
            .attr("fill", "#ff6b6b")
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        /* Tongue sticking out */
        let tongue = drawing.append("rect")
            .attr("x", frogX + 20)
            .attr("y", frogY + 85)
            .attr("width", 35)
            .attr("height", 8)
            .attr("fill", "#ff9999")
            .attr("stroke", "#cc6666")
            .attr("stroke-width", 1);
            
        /* Tongue tip (rounded end) */
        let tongueTip = drawing.append("ellipse")
            .attr("cx", frogX + 55)
            .attr("cy", frogY + 89)
            .attr("rx", 5)
            .attr("ry", 4)
            .attr("fill", "#ff9999")
            .attr("stroke", "#cc6666")
            .attr("stroke-width", 1);
    }

    /* Left leg - filled teal polygon */
    let leftLeg = drawing.append("polygon")
        .attr("points", 
            (frogX - 45) + "," + (frogY + 165) + " " +  // 180 - 225 = -45
            (frogX - 30) + "," + (frogY + 165) + " " +  // 195 - 225 = -30
            (frogX - 5) + "," + (frogY + 220) + " " +   // 220 - 225 = -5
            (frogX - 15) + "," + (frogY + 220))         // 210 - 225 = -15
        .attr("fill", "teal")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Right leg - filled teal polygon */
    let rightLeg = drawing.append("polygon")
        .attr("points",
            (frogX + 35) + "," + (frogY + 165) + " " +  // 260 - 225 = 35
            (frogX + 50) + "," + (frogY + 165) + " " +  // 275 - 225 = 50
            (frogX + 20) + "," + (frogY + 220) + " " +  // 245 - 225 = 20
            (frogX + 10) + "," + (frogY + 220))         // 235 - 225 = 10
        .attr("fill", "teal")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    /* Left Foot - Toe 1 */
    let leftToe1 = drawing.append("circle")
        .attr("cx", frogX - 107)  // 118 - 225 = -107
        .attr("cy", frogY + 218)  // 443 - 225 = 218
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 2 */
    let leftToe2 = drawing.append("circle")
        .attr("cx", frogX - 90)   // 135 - 225 = -90
        .attr("cy", frogY + 218)  // 443 - 225 = 218
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 3 */
    let leftToe3 = drawing.append("circle")
        .attr("cx", frogX - 7)    // 218 - 225 = -7
        .attr("cy", frogY + 220)  // 445 - 225 = 220
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Left Foot - Toe 4 */
    let leftToe4 = drawing.append("circle")
        .attr("cx", frogX - 24)   // 201 - 225 = -24
        .attr("cy", frogY + 220)  // 445 - 225 = 220
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 1 */
    let rightToe1 = drawing.append("circle")
        .attr("cx", frogX + 15)   // 240 - 225 = 15
        .attr("cy", frogY + 220)  // 445 - 225 = 220
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 2 */
    let rightToe2 = drawing.append("circle")
        .attr("cx", frogX + 95)   // 320 - 225 = 95
        .attr("cy", frogY + 218)  // 443 - 225 = 218
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 3 */
    let rightToe3 = drawing.append("circle")
        .attr("cx", frogX + 112)  // 337 - 225 = 112
        .attr("cy", frogY + 218)  // 443 - 225 = 218
        .attr("r", 8)
        .attr("fill", "olive")
        .attr("stroke", "black");

    /* Right Foot - Toe 4 */
    let rightToe4 = drawing.append("circle")
        .attr("cx", frogX + 30)   // 255 - 225 = 30
        .attr("cy", frogY + 220)  // 445 - 225 = 220
        .attr("r", 7)
        .attr("fill", "olive")
        .attr("stroke", "black");
}

// Draw initial frog when page loads
drawImage();