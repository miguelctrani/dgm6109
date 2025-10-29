"use strict"


/* **** Function showData **** /
Creates an HTML representation of provided data and outputs it to HTML element with id "output"

Requirements:
function createHtmlFromObject
HTML element with id "output"

Parameters:
data    Data to display

Returns:
data    Unmodified data, to support chaining methods
****************************** */

function showData(data) {
    let display = createHtmlFromObject(data);
    output(display, "output", true);
    return data;
}

/* ***** function output() *****
Appends the provided content to a specified HTML container.
Content may be output as plain text or as HTML.

Parameters:
content     String to be added to an HTML container
container   The id of an HTML container to output to.
            Defaults to "output" if none given.
htmlFlag    Boolean (default false):
            if false, add content within a <p> tag
            if true, treat content as HTML

Returns:
Nothing
******************************** */

function output(content, container = "output", htmlFlag) {
    if (content == undefined) {
        console.log("WARNING: You did not provide anything to output");
    } else {
        let o = document.getElementById(container);
        if (!o) {
            console.log("ERROR: You did not specify an HTML container for output, and default id 'output' does not exist.")
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
}

/* ***** function endOutput() *****
Appends a horizontal rule (<hr> element) to
Document Object with specified id

Parameters:
container   The id of an HTML container to output to.
            Defaults to "output" if none given.

Returns: Nothing 

*********************************** */

function endOutput(container = "output") {
    let o = document.getElementById(container);
    if (!o) {
        console.log("ERROR: You did not specify an HTML container for output, and default id 'output' does not exist.");
    } else {
        o.appendChild(document.createElement("hr"));
    }
}

/* ***** function clearOutput() *****
Clears contents of the specified Document Object

Parameters:
container   The id of an HTML container to clear.
            Defaults to "output" if none given.

Returns:
Nothing 

*********************************** */

function clearOutput(container = "output") {
    let o = document.getElementById(container);
    if (!o) {
        console.log("ERROR: You did not specify an HTML container to clear, and default id 'output' does not exist.");
    } else {
        o.innerHTML = "";
    }
}

/* **** Function CreateHtmlFromObject ****
Creates an HTML representation of complex Object data.

Requirements:
Helper function displayList
Helper function displayKeysValues

Parameters:
data    Data to be shown as HTML

Returns:
Formatted Array or Object data, or raw data
if provided data is not Array or Object
************************************** */

function createHtmlFromObject(data) {
    if (Array.isArray(data)) {
        return displayList(data, "", 0);
    } else if (typeof (data) == "object") {
        return displayKeysValues(data, "", 0);
    } else {
        return data;
    }
}

/* **** Function displayList ****
Helper function for CreateHtmlFromObject.
********************************* */

function displayList(arr, text, level) {
    if (!text) {
        text = "";
    }
    if (!level) {
        level = 0;
    }

    text += "[";

    for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i])) {
            level++;
            text = displayList(arr[i], text, level);
            level--;
        } else if (typeof (arr[i]) == "object") {
            level++;
            text = displayKeysValues(arr[i], text, level);
            level--;
        } else {
            text += arr[i];
        }
        if (i < arr.length - 1) {
            text += ", "
        }
    }
    text += "]";
    return text;
}

/* **** Function displayKeysValues ****
Helper function for CreateHtmlFromObject.
************************************** */

function displayKeysValues(obj, text, level) {
    text += "<br/>" + "&nbsp;".repeat(level) + "{" + "<br/>";
    level++;
    let props = Object.getOwnPropertyNames(obj);
    for (let j = 0; j < props.length; j++) {
        text += "&nbsp;".repeat(level) + props[j] + ": ";
        if (Array.isArray(obj[props[j]])) {
            level++;
            text = displayList(obj[props[j]], text, level);
            level--;
        } else if (typeof (obj[props[j]]) == "object") {
            level++;
            text = displayKeysValues(obj[props[j]], text, level);
            level--;
        } else {
            text += obj[props[j]];
        }
        if (j < props.length - 1) {
            text += ", <br/>";
        }
    }
    text += "<br/>" + "&nbsp;".repeat(level - 1) + "}";
    return text;
}