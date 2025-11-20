// Miguel Chavez Trani - Lab #9, Plot 2
// Data source: Personal coding study sessions, October-November 2025
// This visualization uses Array.sort() to show chronological progression

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
    {date: "Oct 27", studyTime: 40, problemsSolved: 3, errorRate: 2, confidence: 4, frustration: 3, notes: "console.log() lerning"},
    {date: "Oct 28", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Oct 29", studyTime: 40, problemsSolved: 2, errorRate: 30, confidence: 4, frustration: 2, notes: "console.log() practice"},
    {date: "Oct 30", studyTime: 40, problemsSolved: 0, errorRate: 0, confidence: 4, frustration: 2, notes: "Concept learning (strings)"},
    {date: "Oct 31", studyTime: 30, problemsSolved: 2, errorRate: 30, confidence: 4, frustration: 1, notes: "Data types"},
    {date: "Nov 1", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Nov 2", studyTime: 0, problemsSolved: 0, errorRate: 0, confidence: 0, frustration: 0, notes: ""},
    {date: "Nov 3", studyTime: 50, problemsSolved: 8, errorRate: 20, confidence: 4, frustration: 1, notes: "Variables Let"},
    {date: "Nov 4", studyTime: 30, problemsSolved: 8, errorRate: 30, confidence: 4, frustration: 1, notes: "Variables cons, var"},
    {date: "Nov 5", studyTime: 50, problemsSolved: 8, errorRate: 40, confidence: 4, frustration: 1, notes: "String interpolation"}
];

// Filter out non-study days (where studyTime = 0) to clean up visualization
// This makes the chart more readable by removing empty data points
dataset = dataset.filter(function(d) {
    return d.studyTime > 0;
});

// ARRAY.SORT() USAGE - This is the key technique for this plot!
// Sort dataset chronologically by date (oldest to newest)
// Source: Array.sort() method - MDN Web Docs
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
dataset.sort(function(a, b) {
    // Convert date strings to Date objects for proper comparison
    // Adding year 2025 to make dates complete
    const dateA = new Date(a.date + ", 2025");
    const dateB = new Date(b.date + ", 2025");
    
    // Return -1 if dateA comes first, 1 if dateB comes first
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
});

console.log("Dataset sorted chronologically by date:");
console.log("Total study sessions:", dataset.length);
console.log(dataset);

// SVG dimensions
const width = 1100;
const height = 600;
const margin = {top: 40, right: 220, bottom: 100, left: 80};
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Create SVG
// Source: D3.js documentation - https://d3js.org
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create main group for chart elements
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Scales
// X scale: Using scalePoint for categorical date data (after sorting)
// Source: D3 scalePoint - https://d3js.org/d3-scale/point
const xScale = d3.scalePoint()
    .domain(dataset.map(d => d.date))  // Uses sorted order!
    .range([0, innerWidth])
    .padding(0.5);

// Y scale: Problems Solved
const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.problemsSolved) + 1])
    .range([innerHeight, 0]);

// Radius scale: Confidence Level (0-5)
const rScale = d3.scaleSqrt()
    .domain([0, 5])
    .range([8, 28]);

// Color scale: Frustration Level
// Green (low frustration) to Red (high frustration)
const colorScale = d3.scaleLinear()
    .domain([0, 5])
    .range(["#27ae60", "#e74c3c"]);

// Draw X axis
const xAxis = d3.axisBottom(xScale);

chart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "10px")
    .attr("transform", "rotate(-45)")
    .attr("text-anchor", "end")
    .attr("dx", "-0.6em")
    .attr("dy", "0.3em");

// X axis label
chart.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 75)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Date (Chronological Order - Oldest to Newest)");

// Draw Y axis
const yAxis = d3.axisLeft(yScale)
    .ticks(8);

chart.append("g")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "12px");

// Y axis label
chart.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -55)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Problems Solved");

// Draw connecting line to show progression over time
// Source: D3 line generator - https://d3js.org/d3-shape/line
const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.problemsSolved))
    .curve(d3.curveMonotoneX);  // Smooth curve

chart.append("path")
    .datum(dataset)
    .attr("fill", "none")
    .attr("stroke", "#95a5a6")
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", "8,4")
    .attr("d", line)
    .attr("opacity", 0.6);

// Draw data points using the SORTED dataset
chart.selectAll("circle.datapoint")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.problemsSolved))
    .attr("r", d => rScale(d.confidence))
    .attr("fill", d => colorScale(d.frustration))
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2.5)
    .attr("opacity", 0.85);

// Create legend for circle sizes (Confidence Level)
const sizeLegend = chart.append("g")
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
        .attr("class", "key-item")
        .style("font-size", "13px")
        .text(`Level ${level}`);
});

// Create legend for colors (Frustration Level)
const colorLegend = chart.append("g")
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
        .attr("class", "key-item")
        .style("font-size", "13px")
        .text(level === 1 ? "Low (1)" : level === 5 ? "High (5)" : level);
});

// Add note about sorting
colorLegend.append("text")
    .attr("x", 0)
    .attr("y", 195)
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style("fill", "#7f8c8d")
    .text("*Data sorted by date")
    .append("tspan")
    .attr("x", 0)
    .attr("dy", "1.3em")
    .text("showing progression");

console.log("Plot 2 rendered successfully with chronologically sorted data!");