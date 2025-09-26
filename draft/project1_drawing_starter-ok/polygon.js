"use strict"

function closedPolygon(...args) {
    if (args.length < 2) {
        console.log("WARNING: No points defined")
        return "";
    }
    let polyString = "";
    // grab each pair of points and add to string of points
    for (let i = 0; i < args.length; i++) {
        polyString += args[i];
        polyString += " ";
    }

    polyString += args[0] + " " + args[1];

    return polyString; // send back our completed String
}