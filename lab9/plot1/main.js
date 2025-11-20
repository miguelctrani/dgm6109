// Miguel Chavez Trani - Lab #9, Plot 1
// Data source: Personal coding study sessions, October-November 2025
// This visualization uses Array.filter() to show only successful study sessions

// Dataset: My actual coding study sessions from spreadsheet
// Source: Personal tracking data from October-November 2025
const dataset = [
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

// ARRAY.FILTER() USAGE - This is the key technique for this plot!
// Filter #1: Remove all days where I didn't study (studyTime = 0)
// Filter #2: Show only breakthrough sessions where I solved 5+ problems
// Source: Array.filter() method - MDN Web Docs
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
const filteredDataset = dataset.filter(function(d) {
    // Only keep sessions where I actually studied AND solved 5 or more problems
    return d.studyTime > 0 && d.problemsSolved >= 5;
});

console.log("Original dataset length:", dataset.length);
console.log("Filtered dataset length (study days with 5+ problems):", filteredDataset.length);
console.log("Filtered data:", filteredDataset);

// SVG dimensions
const width = 1000;
const height = 600;
const margin = {top: 40, right: 200, bottom: 80, left: 80};
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
// X scale: Study Time (minutes)
// Using d3.scaleLinear for continuous numerical data
const xScale = d3.scaleLinear()
    .domain([0, d3.max(filteredDataset, d => d.studyTime) + 20])
    .range([0, innerWidth]);

// Y scale: Problems Solved
const yScale = d3.scaleLinear()
    .domain([0, d3.max(filteredDataset, d => d.problemsSolved) + 1])
    .range([innerHeight, 0]);

// Radius scale: Confidence Level (0-5)
// Using confidence instead of frustration to show positive correlation
const rScale = d3.scaleSqrt()
    .domain([0, 5])
    .range([8, 30]);

// Color scale: Frustration Level (lower is better)
// Green = low frustration (good), Red = high frustration (bad)
const colorScale = d3.scaleLinear()
    .domain([1, 5])
    .range(["#27ae60", "#e74c3c"]);

// Draw X axis
const xAxis = d3.axisBottom(xScale)
    .ticks(8);

chart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll("text")
    .style("font-size", "12px");

// X axis label
chart.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Study Time (minutes)");

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
    .text("Problems Solved");

// Draw data points using the FILTERED dataset
chart.selectAll("circle.datapoint")
    .data(filteredDataset)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("cx", d => xScale(d.studyTime))
    .attr("cy", d => yScale(d.problemsSolved))
    .attr("r", d => rScale(d.confidence))
    .attr("fill", d => colorScale(d.frustration))
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2.5)
    .attr("opacity", 0.75);

// Add labels to each point showing the date
chart.selectAll("text.label")
    .data(filteredDataset)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => xScale(d.studyTime))
    .attr("y", d => yScale(d.problemsSolved) - rScale(d.confidence) - 8)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .style("fill", "#2c3e50")
    .text(d => d.date);

// Create legend for circle sizes (Confidence Level)
const sizeLegend = chart.append("g")
    .attr("transform", `translate(${innerWidth + 20}, 50)`);

sizeLegend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Confidence Level");

// Draw sample circles for confidence legend
const confidenceLevels = [1, 2, 3, 4, 5];
confidenceLevels.forEach((level, i) => {
    sizeLegend.append("circle")
        .attr("cx", 20)
        .attr("cy", i * 38 + 10)
        .attr("r", rScale(level))
        .attr("fill", "#7f8c8d")
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .attr("opacity", 0.7);
    
    sizeLegend.append("text")
        .attr("x", 50)
        .attr("y", i * 38 + 15)
        .attr("class", "key-item")
        .style("font-size", "13px")
        .text(`Level ${level}`);
});

// Create legend for colors (Frustration Level)
const colorLegend = chart.append("g")
    .attr("transform", `translate(${innerWidth + 20}, 260)`);

colorLegend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Frustration Level");

// Draw sample circles for frustration legend
const frustrationLevels = [1, 2, 3, 4, 5];
frustrationLevels.forEach((level, i) => {
    colorLegend.append("circle")
        .attr("cx", 15)
        .attr("cy", i * 32 + 10)
        .attr("r", 12)
        .attr("fill", colorScale(level))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .attr("opacity", 0.75);
    
    colorLegend.append("text")
        .attr("x", 35)
        .attr("y", i * 32 + 15)
        .attr("class", "key-item")
        .style("font-size", "13px")
        .text(level === 1 ? "Low (1)" : level === 5 ? "High (5)" : level);
});

// Add note about filtering
colorLegend.append("text")
    .attr("x", 0)
    .attr("y", 190)
    .style("font-size", "11px")
    .style("font-style", "italic")
    .style("fill", "#7f8c8d")
    .text("*Shows only sessions")
    .append("tspan")
    .attr("x", 0)
    .attr("dy", "1.3em")
    .text("with 5+ problems solved");

console.log("Plot 1 rendered successfully with filtered data!");