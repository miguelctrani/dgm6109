"use strict";

/**
 * Main drawing function that clears the canvas and draws two selected elements.
 * This function reads user inputs from the form, clears the existing drawing,
 * creates two separate SVG groups for the drawings, and calls the appropriate
 * drawing functions based on user selections.
 * 
 * The function also implements a switcheroo animation that swaps the positions
 * of the two drawings after 0.5 seconds.
 */
function makeDrawing() {
    // Get the SVG canvas
    let canvas = d3.select("#canvas");
    
    // Clear the canvas
    canvas.selectAll("*").remove();
    
    // Get user inputs
    let firstChoice = document.getElementById("firstElement").value;
    let firstX = Number(document.getElementById("firstX").value);
    let firstY = Number(document.getElementById("firstY").value);
    
    let secondChoice = document.getElementById("secondElement").value;
    let secondX = Number(document.getElementById("secondX").value);
    let secondY = Number(document.getElementById("secondY").value);
    
    let showOriginChoice = document.getElementById("showOrigin").value;
    let showOrigin = (showOriginChoice === "yes");
    
    // Create two separate groups for the drawings
    let item1 = canvas.append("g").attr("id", "item1");
    let item2 = canvas.append("g").attr("id", "item2");
    
    // Draw first element
    if (firstChoice === "dog") {
        drawDog(item1, firstX, firstY, showOrigin);
    } else if (firstChoice === "frog") {
        frog(item1, firstX, firstY, showOrigin, "closed");
    } else if (firstChoice === "trumpeter") {
        trumpeter(item1, firstX, firstY, showOrigin, "normal");
    }
    
    // Draw second element
    if (secondChoice === "dog") {
        drawDog(item2, secondX, secondY, showOrigin);
    } else if (secondChoice === "frog") {
        frog(item2, secondX, secondY, showOrigin, "open");
    } else if (secondChoice === "trumpeter") {
        trumpeter(item2, secondX, secondY, showOrigin, "step");
    }
    
    // Optional: Animate position swap after 0.5 seconds
    setTimeout(switcheroo, 500);
}

/**
 * Animation function that swaps the positions of the two drawn elements.
 * This creates a smooth transition effect where item1 and item2 exchange places.
 * 
 * To disable animation: Comment out the setTimeout call in makeDrawing()
 * To slow down: Change the .duration(1000) to a larger number (milliseconds)
 * To speed up: Change the .duration(1000) to a smaller number
 */
function switcheroo() {
    // Get current positions
    let item1X = Number(document.getElementById("firstX").value);
    let item1Y = Number(document.getElementById("firstY").value);
    let item2X = Number(document.getElementById("secondX").value);
    let item2Y = Number(document.getElementById("secondY").value);
    
    // Calculate translation distances
    let item1TranslateX = item2X - item1X;
    let item1TranslateY = item2Y - item1Y;
    let item2TranslateX = item1X - item2X;
    let item2TranslateY = item1Y - item2Y;
    
    // Animate the swap
    d3.select("#item1")
        .transition()
        .duration(1000)
        .attr("transform", `translate(${item1TranslateX}, ${item1TranslateY})`);
    
    d3.select("#item2")
        .transition()
        .duration(1000)
        .attr("transform", `translate(${item2TranslateX}, ${item2TranslateY})`);
}

// Draw initial image when page loads
makeDrawing();