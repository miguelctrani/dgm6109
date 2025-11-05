"use strict"

/* Configuration variables: drawing */
let svgWidth = 800;
let svgHeight = 600;
let margin = 25;

/* Resize div to match width of visualization. */
d3.select("#container")
    .style("width", String(svgWidth) + "px");

/* Create drawing canvas */
let svg = d3.select("#canvas")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

/* Draw canvas border */
svg.append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

/* Draw margin border */
svg.append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "5")
    .attr("x", margin)
    .attr("y", margin)
    .attr("width", svgWidth - margin * 2)
    .attr("height", svgHeight - margin * 2);

/* Dataset with all days from your spreadsheet */
let dataset = [
    {studyTime: 50, problemsSolved: 3, frustration: 5},   // Oct 15
    {studyTime: 0, problemsSolved: 0, frustration: 5},    // Oct 16 - S AND W
    {studyTime: 40, problemsSolved: 2, frustration: 5},   // Oct 17
    {studyTime: 120, problemsSolved: 4, frustration: 4},  // Oct 18
    {studyTime: 0, problemsSolved: 0, frustration: 5},    // Oct 19 - NO
    {studyTime: 50, problemsSolved: 5, frustration: 4},   // Oct 20
    {studyTime: 0, problemsSolved: 0, frustration: 0},    // Oct 21 - S/W
    {studyTime: 40, problemsSolved: 2, frustration: 5},   // Oct 22
    {studyTime: 0, problemsSolved: 0, frustration: 5},    // Oct 23 - w/s
    {studyTime: 30, problemsSolved: 0, frustration: 3},   // Oct 24
    {studyTime: 0, problemsSolved: 0, frustration: 0},    // Oct 25 - NO
    {studyTime: 0, problemsSolved: 0, frustration: 0},    // Oct 26 - NO
    {studyTime: 40, problemsSolved: 3, frustration: 3},   // Oct 27
    {studyTime: 0, problemsSolved: 0, frustration: 0},    // Oct 28 - W/S
    {studyTime: 40, problemsSolved: 2, frustration: 2},   // Oct 29
    {studyTime: 40, problemsSolved: 0, frustration: 2},   // Oct 30
    {studyTime: 30, problemsSolved: 2, frustration: 1}    // Oct 31
];

/* Create scale functions to map data values to pixel positions */
// xScale maps study time (0-130 minutes) to horizontal pixel positions
let xScale = d3.scaleLinear()
    .domain([0, 130])
    .range([margin, svgWidth - margin]);

// yScale maps problems solved (0-6) to vertical pixel positions
let yScale = d3.scaleLinear()
    .domain([0, 6])
    .range([svgHeight - margin, margin]);

// radiusScale maps frustration level (0-5) to circle radius sizes
let radiusScale = d3.scaleLinear()
    .domain([0, 5])
    .range([5, 25]);

/* Sort dataset so largest circles (highest frustration) are drawn first */
// This prevents large circles from covering smaller ones
dataset.sort(function(a, b) {
    return b.frustration - a.frustration;
});

/* Create circles for each data point */
let circles = svg.selectAll("circle")
    .data(dataset)
    .join("circle");

/* Set circle attributes based on data values */
circles.attr("r", function(value) {
        // Circle radius represents frustration level
        return radiusScale(value.frustration);
    })
    .attr("cx", function (value) {
        // X position represents study time
        return xScale(value.studyTime);
    })
    .attr("cy", function (value) {
        // Y position represents problems solved
        return yScale(value.problemsSolved);
    })
    .attr("fill", "#4A90E2")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#2E5C8A")
    .attr("stroke-width", 1.5);

/**** Label the axes ****/
// X-axis label
let xAxisLabel = svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
    .text("Daily Coding Study Time (minutes)");

// Y-axis label (rotated to read vertically)
let yAxisLabel = svg.append("text")
    .attr("x", -svgHeight / 2)
    .attr("y", margin / 2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("transform", "rotate(-90)")
    .text("Number of Problems Solved");

/**** Label key graph coordinates ****/
// Origin label
let originLabel = svg.append("text")
    .attr("x", margin)
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
    .text("0");

// Maximum X value label
let xMaxLabel = svg.append("text")
    .attr("x", xScale(130))
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
    .text("130");

// Maximum Y value label
let yMaxLabel = svg.append("text")
    .attr("x", margin)
    .attr("y", yScale(6))
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .text("6");

/**** Create Legend to explain circle sizes ****/
let legendX = svgWidth - 180;
let legendY = margin + 20;

// Legend title
svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("font-weight", "bold")
    .text("Frustration Level");

// Large circle (frustration = 5)
svg.append("circle")
    .attr("cx", legendX + 15)
    .attr("cy", legendY + 30)
    .attr("r", radiusScale(5))  // ← CHANGED from 0 to 5
    .attr("fill", "#4A90E2")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#2E5C8A")
    .attr("stroke-width", 1.5);

svg.append("text")
    .attr("x", legendX + 40)
    .attr("y", legendY + 30)
    .attr("alignment-baseline", "middle")
    .text("5 (High)");  // ← CHANGED from "0 (Low)"

// Medium circle example (frustration = 2.5)
svg.append("circle")
    .attr("cx", legendX + 15)
    .attr("cy", legendY + 60)
    .attr("r", radiusScale(2.5))
    .attr("fill", "#4A90E2")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#2E5C8A")
    .attr("stroke-width", 1.5);

svg.append("text")
    .attr("x", legendX + 40)
    .attr("y", legendY + 60)
    .attr("alignment-baseline", "middle")
    .text("2.5 (Medium)");

// Small circle (frustration = 0)
svg.append("circle")
    .attr("cx", legendX + 15)
    .attr("cy", legendY + 100)
    .attr("r", radiusScale(0))  // ← CHANGED from 5 to 0
    .attr("fill", "#4A90E2")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "#2E5C8A")
    .attr("stroke-width", 1.5);

svg.append("text")
    .attr("x", legendX + 40)
    .attr("y", legendY + 100)
    .attr("alignment-baseline", "middle")
    .text("0 (Low)");  // ← CHANGED from "5 (High)"