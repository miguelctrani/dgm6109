"use strict";

document.getElementById("submit")
    .addEventListener("click", function() {

    // Get the temperature from the input field and convert to a number
    let fahrenheit = Number(document.getElementById("inputF").value);

    // Get the user's conversion choice (c or k)
    let conversionType = document.getElementById("conversionChoice").value;

    // Convert Fahrenheit to Celsius
    // Formula: (F - 32) × 5/9
    let celsius = (fahrenheit - 32) * 5/9;

    // Convert Fahrenheit to Kelvin
    // Formula: (F - 32) × 5/9 + 273.15
    let kelvin = (fahrenheit - 32) * 5/9 + 273.15;

    // Always output the original Fahrenheit temperature
    output("Original temperature (F): " + fahrenheit);

    // Using if/else to show only the selected conversion
    if (conversionType === "c") {
        output("Converted to Celsius: " + celsius);
    } else {
        output("Converted to Kelvin: " + kelvin);
    }

    /* Commented out version using two separate if statements:
    
    if (conversionType === "c") {
        output("Converted to Celsius: " + celsius);
    }
    
    if (conversionType === "k") {
        output("Converted to Kelvin: " + kelvin);
    }
    
    I prefer the if/else version because it is more efficient. 
    With if/else, the program only checks one condition to decide 
    between the two options. With two separate if statements, 
    the program checks both conditions every time, even though 
    only one can be true. The if/else makes it clearer that 
    these are mutually exclusive choices.
    */

});