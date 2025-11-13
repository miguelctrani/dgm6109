// Temperature Converter for Lab #1
// Miguel Chavez Trani

// Store the average temperature in Fahrenheit for Coacalco, Estado de México in March
let fahrenheit = 70; // Average temperature in Coacalco, Estado de México in March

// Convert Fahrenheit to Celsius
// Formula: (F - 32) × 5/9
let celsius = (fahrenheit - 32) * 5/9;

// Convert Fahrenheit to Kelvin
// Formula: (F - 32) × 5/9 + 273.15
let kelvin = (fahrenheit - 32) * 5/9 + 273.15;

// Display all three temperatures in the console with clear labels
console.log("Temperature (Fahrenheit): " + fahrenheit);
console.log("Temperature (Celsius): " + celsius);
console.log("Temperature (Kelvin): " + kelvin);