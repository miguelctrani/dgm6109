"use strict"

// Miguel Chavez Trani - Term Project Draft 1
// Data source: Personal coding study sessions, October-November 2025
// Question: Does more practice reduce frustration, or does frustration decrease simply with time?
// This visualization focuses on TWO factors: Problems Solved (practice) and Frustration Level

// SVG dimensions following project specifications
let svgWidth = 1100;
let svgHeight = 600;

// Margins for proper spacing of axes and legends
let margin = {
    top: 40,
    right: 220,
    bottom: 100,
    left: 80
};

// Global variables for scales and axes
let xScale,  // Scale for problems solved (x-axis) - represents practice
    yScale,  // Scale for frustration level (y-axis) - represents emotional state
    rScale,  // Scale for confidence level (circle radius) - supporting detail
    colorScale;  // Scale for frustration level (circle color) - reinforces y-axis

// Create SVG canvas with border
// Source: D3.js Selection API - https://d3js.org/d3-selection
let svg = d3.select("#canvas")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Add border around entire SVG for visual distinction
// Source: SVG rect element - https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
svg.append("rect")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

// Create group for main chart elements with margin transform
// Source: SVG transform attribute - https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform
let viz = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Dataset: My actual coding study sessions from spreadsheet
// Source: Personal tracking data from October-November 2025
let dataset = [
    {date: "Oct 15", studyTime: 50, problemsSolved: 3, errorRate: 70, confidence: 0, frustration: 5, notes: "Loops practice, some bugs"},
    {date: "Oct 16", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 5, notes: ""},
    {date: "Oct 17", studyTime: 40, problemsSolved: 2, errorRate: 70, confidence: 1, frustration: 5, notes: "Loops practice, some bugs"},
    {date: "Oct 18", studyTime: 120, problemsSolved: 4, errorRate: 60, confidence: 1, frustration: 4, notes: "IF/ELSE statements, progress"},
    {date: "Oct 19", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 5, notes: ""},
    {date: "Oct 20", studyTime: 50, problemsSolved: 5, errorRate: 70, confidence: 1, frustration: 4, notes: "IF/ELSE statements, progress"},
    {date: "Oct 21", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Oct 22", studyTime: 40, problemsSolved: 2, errorRate: 70, confidence: 1, frustration: 5, notes: "Loops practice, some bugs"},
    {date: "Oct 23", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 5, notes: "Had issues w/ syntax"},
    {date: "Oct 24", studyTime: 30, problemsSolved: 0, errorRate: 0, confidence: 3, frustration: 3, notes: "Primitive Data Types CONCEPT learning"},
    {date: "Oct 25", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Oct 26", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Oct 27", studyTime: 40, problemsSolved: 3, errorRate: 2, confidence: 4, frustration: 3, notes: "console.log() learning"},
    {date: "Oct 28", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Oct 29", studyTime: 40, problemsSolved: 2, errorRate: 30, confidence: 4, frustration: 2, notes: "console.log() practice"},
    {date: "Oct 30", studyTime: 40, problemsSolved: 0, errorRate: 0, confidence: 4, frustration: 2, notes: "Concept learning (strings)"},
    {date: "Oct 31", studyTime: 30, problemsSolved: 2, errorRate: 30, confidence: 4, frustration: 1, notes: "Data types"},
    {date: "Nov 1", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Nov 2", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Nov 3", studyTime: 50, problemsSolved: 8, errorRate: 20, confidence: 4, frustration: 1, notes: "Variables Let"},
    {date: "Nov 4", studyTime: 30, problemsSolved: 8, errorRate: 30, confidence: 4, frustration: 1, notes: "Variables const, var"},
    {date: "Nov 5", studyTime: 50, problemsSolved: 8, errorRate: 40, confidence: 4, frustration: 1, notes: "String interpolation"}
];

/**** function organizeData(rawData) *****
 * Filters and sorts the dataset to prepare it for visualization
 * 
 * Parameters:
 *   rawData (Array of Objects) - The original dataset of coding sessions
 * 
 * Returns:
 *   Array of Objects - Filtered dataset containing only study days (studyTime > 0),
 *                      sorted chronologically by date from oldest to newest
 * 
 * This function performs two key operations:
 *   1. Filters out non-study days (rest days where studyTime = 0)
 *   2. Sorts remaining data chronologically - CRITICAL for the connecting line
 *      that shows my journey through time while positioned by practice level
 *****/
function organizeData(rawData) {
    // Filter out non-study days to clean up visualization
    // Source: Array.prototype.filter() - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    let filtered = rawData.filter(function(d) {
        return d.studyTime > 0;
    });
    
    // Sort dataset chronologically by date (oldest to newest)
    // This allows the connecting line to show time progression while circles
    // are positioned by practice level (problems solved)
    // Source: Array.prototype.sort() - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    filtered.sort(function(a, b) {
        // Convert date strings to Date objects for proper comparison
        // Source: Date constructor - MDN Web Docs
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
        const dateA = new Date(a.date + ", 2025");
        const dateB = new Date(b.date + ", 2025");
        
        // Return negative if dateA comes first, positive if dateB comes first
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
    });
    
    console.log("Dataset organized - filtered and sorted chronologically");
    console.log("Total study sessions:", filtered.length);
    
    return filtered;
}

/**** function buildScales(data) *****
 * Creates all D3 scale functions needed for the visualization
 * 
 * Parameters:
 *   data (Array of Objects) - The organized dataset of study sessions
 * 
 * Returns:
 *   Nothing (sets global scale variables)
 * 
 * Creates four scales:
 *   - xScale: Maps problemsSolved (practice) to horizontal pixel position
 *   - yScale: Maps frustration (0-5) to vertical pixel position
 *   - rScale: Maps confidence (0-5) to circle radius (pixels)
 *   - colorScale: Maps frustration (0-5) to color (red to green)
 *****/
function buildScales(data) {
    // Calculate inner dimensions (accounting for margins)
    const innerWidth = svgWidth - (margin.left + margin.right);
    const innerHeight = svgHeight - (margin.top + margin.bottom);
    
    // X scale: Problems Solved (represents practice level)
    // Source: d3.scaleLinear - D3.js documentation
    // https://d3js.org/d3-scale/linear
    xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.problemsSolved) + 1])
        .range([0, innerWidth]);
    
    // Y scale: Frustration Level (0-5)
    // Source: d3.scaleLinear - D3.js documentation
    // https://d3js.org/d3-scale/linear
    yScale = d3.scaleLinear()
        .domain([0, 5])
        .range([innerHeight, 0]);  // Inverted for SVG coordinates (high frustration at top)
    
    // Radius scale: Confidence Level (0-5) - supporting visual detail
    // Using scaleSqrt so area is proportional to value
    // Source: d3.scaleSqrt - D3.js documentation
    // https://d3js.org/d3-scale/pow#scaleSqrt
    rScale = d3.scaleSqrt()
        .domain([0, 5])
        .range([8, 28]);  // Minimum and maximum circle radius
    
    // Color scale: Frustration Level (0-5)
    // Green (low frustration) to Red (high frustration)
    // This reinforces the y-axis encoding
    // Source: d3.scaleLinear - D3.js documentation
    // https://d3js.org/d3-scale/linear
    colorScale = d3.scaleLinear()
        .domain([0, 5])
        .range(["#27ae60", "#e74c3c"]);  // Green to red
    
    console.log("Scales built successfully");
}

/**** function drawVisualization(data, drawing) *****
 * Renders the complete scatterplot visualization with axes, data points, and legends
 * 
 * Parameters:
 *   data (Array of Objects) - The organized dataset to visualize
 *   drawing (D3 selection) - The SVG group element to draw into
 * 
 * Returns:
 *   Nothing (draws directly to SVG)
 * 
 * Draws:
 *   - X and Y axes with labels (showing the two main factors: practice and frustration)
 *   - Scatterplot circles representing each study session
 *   - Connecting line showing chronological progression through time
 *   - Two legends explaining additional visual encodings (confidence size, frustration color)
 *****/
function drawVisualization(data, drawing) {
    const innerWidth = svgWidth - (margin.left + margin.right);
    const innerHeight = svgHeight - (margin.top + margin.bottom);
    
    // Draw X axis (Problems Solved - practice measure)
    // Source: d3.axisBottom - D3.js documentation
    // https://d3js.org/d3-axis#axisBottom
    const xAxis = d3.axisBottom(xScale)
        .ticks(9);
    
    drawing.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "11px");
    
    // X axis label
    // Source: SVG text element - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
    drawing.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Problems Solved (Practice Level)");
    
    // Draw Y axis (Frustration Level)
    // Source: d3.axisLeft - D3.js documentation
    // https://d3js.org/d3-axis#axisLeft
    const yAxis = d3.axisLeft(yScale)
        .ticks(5);
    
    drawing.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px");
    
    // Y axis label
    // Source: SVG text element with rotation - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
    drawing.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Frustration Level (0 = Low, 5 = High)");
    
    // Draw connecting line to show chronological progression
    // This line connects points in TIME order but positions them by PRACTICE level
    // allowing us to see if time or practice drives frustration change
    // Source: d3.line - D3.js documentation
    // https://d3js.org/d3-shape/line
    const line = d3.line()
        .x(d => xScale(d.problemsSolved))
        .y(d => yScale(d.frustration))
        .curve(d3.curveMonotoneX);  // Smooth curve
    
    // Source: SVG path element - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
    drawing.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#95a5a6")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "8,4")
        .attr("d", line)
        .attr("opacity", 0.6);
    
    // Draw data points (circles for each study session)
    // Source: D3 data join pattern - D3.js documentation
    // https://d3js.org/d3-selection/joining
    drawing.selectAll("circle.datapoint")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "datapoint")
        .attr("cx", d => xScale(d.problemsSolved))
        .attr("cy", d => yScale(d.frustration))
        .attr("r", d => rScale(d.confidence))
        .attr("fill", d => colorScale(d.frustration))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.85);
    
    // Create legend for circle sizes (Confidence Level - supporting detail)
    // Source: D3.js Selection API - https://d3js.org/d3-selection
    const sizeLegend = drawing.append("g")
        .attr("transform", `translate(${innerWidth + 20}, 50)`);
    
    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Confidence Level");
    
    sizeLegend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("font-size", "11px")
        .style("font-style", "italic")
        .style("fill", "#7f8c8d")
        .text("(Circle size)");
    
    // Draw sample circles for confidence legend
    // Source: Array.prototype.forEach - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    const confidenceLevels = [1, 2, 3, 4];
    confidenceLevels.forEach((level, i) => {
        sizeLegend.append("circle")
            .attr("cx", 20)
            .attr("cy", i * 38 + 30)
            .attr("r", rScale(level))
            .attr("fill", "#95a5a6")
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 2)
            .attr("opacity", 0.7);
        
        sizeLegend.append("text")
            .attr("x", 50)
            .attr("y", i * 38 + 35)
            .style("font-size", "13px")
            .text(`Level ${level}`);
    });
    
    // Create legend for colors (Frustration Level)
    // Source: D3.js Selection API - https://d3js.org/d3-selection
    const colorLegend = drawing.append("g")
        .attr("transform", `translate(${innerWidth + 20}, 240)`);
    
    colorLegend.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Frustration Level");
    
    colorLegend.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .style("font-size", "11px")
        .style("font-style", "italic")
        .style("fill", "#7f8c8d")
        .text("(Circle color)");
    
    // Draw sample circles for frustration legend
    // Source: Array.prototype.forEach - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    const frustrationLevels = [1, 2, 3, 4, 5];
    frustrationLevels.forEach((level, i) => {
        colorLegend.append("circle")
            .attr("cx", 15)
            .attr("cy", i * 30 + 25)
            .attr("r", 11)
            .attr("fill", colorScale(level))
            .attr("stroke", "#2c3e50")
            .attr("stroke-width", 2)
            .attr("opacity", 0.85);
        
        colorLegend.append("text")
            .attr("x", 35)
            .attr("y", i * 30 + 30)
            .style("font-size", "13px")
            .text(level === 1 ? "Low (1)" : level === 5 ? "High (5)" : level);
    });
    
    // Add note about chronological line
    // Source: SVG text and tspan elements - MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan
    colorLegend.append("text")
        .attr("x", 0)
        .attr("y", 195)
        .style("font-size", "11px")
        .style("font-style", "italic")
        .style("fill", "#7f8c8d")
        .text("*Line shows time")
        .append("tspan")
        .attr("x", 0)
        .attr("dy", "1.3em")
        .text("progression");
    
    console.log("Visualization rendered successfully!");
}

/**** function buildVisualization(rawData) *****
 * Main function that orchestrates the entire visualization creation process
 * 
 * Parameters:
 *   rawData (Array of Objects) - The original unprocessed dataset
 * 
 * Returns:
 *   Array of Objects - The processed dataset (for potential further use)
 * 
 * Execution flow:
 *   1. Organizes data (filters out rest days and sorts chronologically by date)
 *   2. Builds all necessary scales (x for practice, y for frustration, etc.)
 *   3. Draws the complete visualization (axes, circles, line, legends)
 *****/
function buildVisualization(rawData) {
    let renderData = organizeData(rawData);
    buildScales(renderData);
    drawVisualization(renderData, viz);
    return renderData;
}

// Execute visualization build with dataset
buildVisualization(dataset);

console.log("Term Project Draft 1 - Visualization complete!");