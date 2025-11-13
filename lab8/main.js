// Lab #8: Practice More Scatterplot Techniques
// Student: Miguel Chavez Trani
// Data source: Personal coding study tracking spreadsheet (October-November 2025)
//
// HYPOTHESIS: As my problem-solving ability increases, my frustration levels decrease.
// Study time (represented by circle size) shows the time investment for each session.
// Problem-solving performance (represented by color) demonstrates my growing understanding
// of coding fundamentals through practice.

/**** CONFIGURATION VARIABLES: SVG ****/
const svgWidth = 800;
const svgHeight = 600;
const marginTop = 80;
const marginBottom = 100;
const marginLeft = 100;
const marginRight = 220;

// Calculate plot area dimensions
const plotWidth = svgWidth - marginLeft - marginRight;
const plotHeight = svgHeight - marginTop - marginBottom;

/**** CONFIGURATION VARIABLES: DATA ****/
// Dataset from personal coding study tracking (Oct 15 - Nov 5, 2025)
// Only including days where actual coding study occurred (study time > 0)
// Source: Personal study log spreadsheet
// Each row represents one study session tracking my learning progress
const dataset = [
    {date: "Oct 15", studyTime: 50, problemsSolved: 3, frustration: 5},
    {date: "Oct 17", studyTime: 40, problemsSolved: 2, frustration: 5},
    {date: "Oct 18", studyTime: 120, problemsSolved: 4, frustration: 4},
    {date: "Oct 20", studyTime: 50, problemsSolved: 5, frustration: 4},
    {date: "Oct 22", studyTime: 40, problemsSolved: 2, frustration: 5},
    {date: "Oct 24", studyTime: 30, problemsSolved: 0, frustration: 3},
    {date: "Oct 27", studyTime: 40, problemsSolved: 3, frustration: 3},
    {date: "Oct 29", studyTime: 40, problemsSolved: 2, frustration: 2},
    {date: "Oct 30", studyTime: 40, problemsSolved: 0, frustration: 2},
    {date: "Oct 31", studyTime: 30, problemsSolved: 2, frustration: 1},
    {date: "Nov 3", studyTime: 50, problemsSolved: 8, frustration: 1},
    {date: "Nov 4", studyTime: 30, problemsSolved: 8, frustration: 1},
    {date: "Nov 5", studyTime: 50, problemsSolved: 8, frustration: 1}
];

/**** PREPROCESS DATA ****/
// Sort dataset by study time in DESCENDING order 
// This ensures largest circles are drawn first (appear in back)
// preventing them from hiding smaller circles
// Source: Lab #8 slides pages 3, 7-8 on Array.sort() usage
dataset.sort(function(a, b) {
    return b.studyTime - a.studyTime;
});

// Calculate min/max values for scale domains using d3.min() and d3.max()
// Source: D3.js API documentation - https://github.com/d3/d3-array
const studyTimeMin = d3.min(dataset, function(d) { return d.studyTime; });
const studyTimeMax = d3.max(dataset, function(d) { return d.studyTime; });
const frustrationMin = d3.min(dataset, function(d) { return d.frustration; });
const frustrationMax = d3.max(dataset, function(d) { return d.frustration; });
const problemsMin = d3.min(dataset, function(d) { return d.problemsSolved; });
const problemsMax = d3.max(dataset, function(d) { return d.problemsSolved; });

/**** SCALE FUNCTIONS ****/
// X-axis: Frustration level (0-5 scale, linear scale)
// Domain starts at 0 to show full range of frustration
// Source: D3 scaleLinear documentation
const xScale = d3.scaleLinear()
    .domain([0, frustrationMax + 0.5])
    .range([marginLeft, svgWidth - marginRight]);

// Y-axis: Study time in minutes (linear scale)
// Domain starts at 0 to properly show time investment
const yScale = d3.scaleLinear()
    .domain([0, studyTimeMax + 10])
    .range([svgHeight - marginBottom, marginTop]);

// Circle radius: Study time in minutes
// Using square root scale for better visual area perception
// Source: Lab #8 slides page 2 - recommends scaleSqrt for circle sizing
const radiusScale = d3.scaleSqrt()
    .domain([studyTimeMin, studyTimeMax])
    .range([10, 40]);

/**** COLOR FUNCTION ****/
// Color represents problem-solving performance (numerical data using conditional logic)
// Low performance (0-2 problems) = red (struggling, need more practice)
// Medium performance (3-5 problems) = orange (making progress)  
// High performance (6+ problems) = green (strong understanding)
// Source: Lab #8 assignment requirements for color-coding numerical data with ranges
function getColorByProblems(problemsSolved) {
    if (problemsSolved <= 2) {
        return "#e74c3c"; // red - low performance
    } else if (problemsSolved <= 5) {
        return "#e67e22"; // orange - medium performance
    } else {
        return "#27ae60"; // green - high performance
    }
}

/**** CREATE SVG ****/
const svg = d3.select("#canvas")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

/**** DRAW MARGIN GUIDE BOX ****/
// This dashed box helps visualize the plotting area during development
// COMMENTED OUT for final submission as required by Lab #8 instructions
/*
svg.append("rect")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", plotWidth)
    .attr("height", plotHeight)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-dasharray", "5,5");
*/

/**** DRAW AXES LINES ****/
// X-axis line extends from minimum to maximum of domain
// Source: Class #7 examples on drawing axis lines with scale functions
svg.append("line")
    .attr("x1", xScale(0))
    .attr("y1", svgHeight - marginBottom)
    .attr("x2", xScale(frustrationMax + 0.5))
    .attr("y2", svgHeight - marginBottom)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2);

// Y-axis line extends from minimum to maximum of domain
svg.append("line")
    .attr("x1", marginLeft)
    .attr("y1", yScale(0))
    .attr("x2", marginLeft)
    .attr("y2", yScale(studyTimeMax + 10))
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2);

/**** AXIS TITLE LABELS ****/
// X-axis title label (centered below axis)
svg.append("text")
    .attr("x", marginLeft + plotWidth / 2)
    .attr("y", svgHeight - 15)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Frustration Level (0-5 scale)");

// Y-axis title label (rotated, centered on left side)
svg.append("text")
    .attr("x", -(marginTop + plotHeight / 2))
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-family", "sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Study Time (minutes)");

/**** X-AXIS VALUE LABELS AND TICK MARKS ****/
// Create tick marks and labels for frustration level (0-5)
// Source: Previous class exercises on axis labeling with for loops
for (let i = 0; i <= 5; i += 1) {
    // Tick mark line
    svg.append("line")
        .attr("x1", xScale(i))
        .attr("y1", svgHeight - marginBottom)
        .attr("x2", xScale(i))
        .attr("y2", svgHeight - marginBottom + 6)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1);
    
    // Value label
    svg.append("text")
        .attr("x", xScale(i))
        .attr("y", svgHeight - marginBottom + 22)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .text(i);
}

/**** Y-AXIS VALUE LABELS AND TICK MARKS ****/
// Create tick marks and labels for study time
// Using 30-minute intervals for readability
for (let i = 0; i <= 120; i += 30) {
    // Tick mark line
    svg.append("line")
        .attr("x1", marginLeft - 6)
        .attr("y1", yScale(i))
        .attr("x2", marginLeft)
        .attr("y2", yScale(i))
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 1);
    
    // Value label
    svg.append("text")
        .attr("x", marginLeft - 12)
        .attr("y", yScale(i) + 4)
        .attr("text-anchor", "end")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .text(i);
}

/**** DRAW DATA CIRCLES (BUBBLEPLOT) ****/
// Data has been sorted by study time (largest first) so circles layer properly
// Source: D3 data join pattern from class examples
svg.selectAll("circle.datapoint")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "datapoint")
    .attr("cx", function(d) { 
        return xScale(d.frustration); 
    })
    .attr("cy", function(d) { 
        return yScale(d.studyTime); 
    })
    .attr("r", function(d) { 
        return radiusScale(d.studyTime); 
    })
    .attr("fill", function(d) { 
        return getColorByProblems(d.problemsSolved); 
    })
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1.5);

/**** COLOR KEY (PROBLEM-SOLVING PERFORMANCE) ****/
// Position key in right margin area
const colorKeyX = svgWidth - marginRight + 15;
const colorKeyY = marginTop;

// Key container box
svg.append("rect")
    .attr("x", colorKeyX)
    .attr("y", colorKeyY)
    .attr("width", 190)
    .attr("height", 135)
    .attr("fill", "white")
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2);

// Key title
svg.append("text")
    .attr("x", colorKeyX + 95)
    .attr("y", colorKeyY + 22)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Problems Solved");

// Problem-solving performance ranges and colors
// Low performance (0-2 problems)
svg.append("circle")
    .attr("cx", colorKeyX + 20)
    .attr("cy", colorKeyY + 50)
    .attr("r", 9)
    .attr("fill", "#e74c3c")
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", colorKeyX + 38)
    .attr("y", colorKeyY + 55)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text("0-2 (low)");

// Medium performance (3-5 problems)
svg.append("circle")
    .attr("cx", colorKeyX + 20)
    .attr("cy", colorKeyY + 78)
    .attr("r", 9)
    .attr("fill", "#e67e22")
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", colorKeyX + 38)
    .attr("y", colorKeyY + 83)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text("3-5 (medium)");

// High performance (6+ problems)
svg.append("circle")
    .attr("cx", colorKeyX + 20)
    .attr("cy", colorKeyY + 106)
    .attr("r", 9)
    .attr("fill", "#27ae60")
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", colorKeyX + 38)
    .attr("y", colorKeyY + 111)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text("6+ (high)");

/**** SIZE KEY (STUDY TIME) ****/
// Position below color key in right margin
const sizeKeyX = svgWidth - marginRight + 15;
const sizeKeyY = marginTop + 155;

// Key container box
svg.append("rect")
    .attr("x", sizeKeyX)
    .attr("y", sizeKeyY)
    .attr("width", 190)
    .attr("height", 170)
    .attr("fill", "white")
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2);

// Key title
svg.append("text")
    .attr("x", sizeKeyX + 95)
    .attr("y", sizeKeyY + 22)
    .attr("text-anchor", "middle")
    .style("font-family", "sans-serif")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Study Time (min)");

// Show three representative values: low (30), medium (60), high (120)
// Calculate middle value for medium study time
const studyTimeMid = Math.round((studyTimeMin + studyTimeMax) / 2);

// Low study time circle (small)
svg.append("circle")
    .attr("cx", sizeKeyX + 35)
    .attr("cy", sizeKeyY + 55)
    .attr("r", radiusScale(studyTimeMin))
    .attr("fill", "#95a5a6")
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", sizeKeyX + 35 + radiusScale(studyTimeMin) + 8)
    .attr("y", sizeKeyY + 59)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text(`${studyTimeMin} min (low)`);

// Medium study time circle
svg.append("circle")
    .attr("cx", sizeKeyX + 35)
    .attr("cy", sizeKeyY + 100)
    .attr("r", radiusScale(studyTimeMid))
    .attr("fill", "#95a5a6")
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", sizeKeyX + 35 + radiusScale(studyTimeMid) + 8)
    .attr("y", sizeKeyY + 104)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text(`${studyTimeMid} min (medium)`);

// High study time circle (large)
svg.append("circle")
    .attr("cx", sizeKeyX + 35)
    .attr("cy", sizeKeyY + 145)
    .attr("r", radiusScale(studyTimeMax))
    .attr("fill", "#95a5a6")
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 1);

svg.append("text")
    .attr("x", sizeKeyX + 35 + radiusScale(studyTimeMax) + 8)
    .attr("y", sizeKeyY + 149)
    .style("font-family", "sans-serif")
    .style("font-size", "11px")
    .text(`${studyTimeMax} min (high)`);

    // I support myself using the slices, the notes I took and also asking support
    //to Claude, in some parts to help me how could I update some information and how is 
    //the best way to cdifferentiate the information I wanted to use