"use strict"

/* Configuration variables: drawing */
let svgWidth = 800;
let svgHeight = 600;
let margin = 25;

/* Resize  div to match width of visualization. */
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

/* Draw margin border. */
svg.append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "5")
    .attr("x", margin)
    .attr("y", margin)
    .attr("width", svgWidth - margin * 2)
    .attr("height", svgHeight - margin * 2);

let dataset = [
    {studyTime: 50, problemsSolved: 3},
    {studyTime: 40, problemsSolved: 2},
    {studyTime: 120, problemsSolved: 4},
    {studyTime: 50, problemsSolved: 5},
    {studyTime: 40, problemsSolved: 2},
    {studyTime: 30, problemsSolved: 0},
    {studyTime: 40, problemsSolved: 3}
];

let xScale = d3.scaleLinear()
    .domain([0, 130])  // Changed from [0, 0] to [0, 130]
    .range([margin, svgWidth - margin]);

let yScale = d3.scaleLinear()
    .domain([0, 6])  // Changed from [0, 0] to [0, 6]
    .range([svgHeight - margin, margin]);

let circles = svg.selectAll("circle")
    .data(dataset)
    .join("circle");

circles.attr("r", 10)
    .attr("cx", function (value) {
        return xScale(value.studyTime);  // Changed from value.x
    })
    .attr("cy", function (value) {
        return yScale(value.problemsSolved);  // Changed from value.y
    })
/**** label the axes ****/
let xAxisLabel = svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
   .text("Daily Coding Study Time (minutes)");  // Changed from "X axis label"

let yAxisLabel = svg.append("text")
    .attr("x", -svgHeight / 2)
    .attr("y", margin / 2)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .text("Y axis label")
    .text("Number of Problems Solved")  // Changed from "Y axis label"

/**** label key graph coordinates ****/
let originLabel = svg.append("text")
    .attr("x", margin)
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
    .text("0,0");
// ADD THESE TWO NEW LABELS:
let xMaxLabel = svg.append("text")
    .attr("x", xScale(130))
    .attr("y", svgHeight - (margin / 2))
    .attr("text-anchor", "middle")
    .text("130");

let yMaxLabel = svg.append("text")
    .attr("x", margin)
    .attr("y", yScale(6))
    .attr("text-anchor", "end")
    .attr("alignment-baseline", "middle")
    .text("6");

