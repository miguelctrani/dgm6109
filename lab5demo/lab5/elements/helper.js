"use strict";

/**
 * Creates a closed polygon string from coordinate pairs
 * @param {...number} coords - Alternating x,y coordinates
 * @returns {string} A string of coordinates for a closed polygon
 */
function closedPolygon(...coords) {
    let result = "";
    for (let i = 0; i < coords.length; i += 2) {
        result += coords[i] + "," + coords[i + 1] + " ";
    }
    // Close the polygon by adding the first point again
    result += coords[0] + "," + coords[1];
    return result.trim();
}