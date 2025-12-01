"use strict"

/* ***** function output() *****
Appends the provided String to an HTML element called "output". String may be output as plain text or as HTML.

Requirements: An element with id="output" in the current Document Object (generally the index.html)

Parameters:
content     String to be added to "output"
htmlFlag    Boolean (default false):
            if false, add content within a <p> tag
            if true, treat content as HTML ready to output

Returns: Nothing
******************************** */

function output(content, htmlFlag) {
    let o = document.getElementById("output");
    if (content == undefined) {
        console.log("WARNING: You did not provide anything to output");
    } else {
        if (!htmlFlag) {
            let p = document.createElement("p");
            let tn = document.createTextNode(content);
            p.appendChild(tn);
            o.appendChild(p);
        } else {
            o.innerHTML += content;
        }
    }
}

/* ***** function rule() *****
Appends a horizontal rule element to an HTML element called "output".

Requirements: An element with id="output" in the current Document Object (generally the index.html)

Parameters:
None

Returns: Nothing
******************************** */

function rule() {
    let o = document.getElementById("output");
    let hr = document.createElement("hr");
    o.appendChild(hr);
}

/* ***** function clear() *****
Clears all DOM elements inside of an HTML element called "output".

Requirements: An element with id="output" in the current Document Object (generally the index.html)

Parameters:
None

Returns: Nothing
******************************** */

function clear() {
    let o = document.getElementById("output");
    o.replaceChildren();
}