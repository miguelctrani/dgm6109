"use strict"

/* ***** Global Variables *****
These variables store user input from the form
******************************** */
let petSpecies;      // The species entered by user (as text)
let petGender;       // The gender selected by user (Male, Female, or Unknown)
let petName;         // The name selected by user (Whiskers, Spot, Porky, Daisy, King, Princess)
let actualSpecies;   // The validated species (will be "cat", "dog", or "pig")

/* ***** Event Listeners *****
Set up form buttons for submit and reset
******************************** */
document.getElementById("submit").addEventListener("click", processForm);

document.getElementById("reset").addEventListener("click", function () {
    clear();
    document.getElementById("submit").toggleAttribute("hidden");
    document.getElementById("reset").toggleAttribute("hidden");
});

/* ***** function processForm() *****
Main function that processes the form submission. Gets form values,
validates them, evaluates business rules, and manages UI buttons.

Parameters: None

Returns: Nothing
******************************** */
function processForm() {
    // Get values from form inputs
    petSpecies = document.getElementById("species").value;
    petGender = document.getElementById("gender").value;
    petName = document.getElementById("petName").value;

    // Track whether evaluation completed successfully
    let evaluationCompleted = false;

    // First validate the form data
    if (validateData()) {
        // If validation passes, evaluate the business rules
        evaluationCompleted = evaluateAnswers();
    }

    // If everything succeeded, toggle buttons
    if (evaluationCompleted) {
        document.getElementById("submit").toggleAttribute("hidden");
        document.getElementById("reset").toggleAttribute("hidden");
    } else {
        // Add horizontal rule to separate multiple error attempts
        rule();
    }
}

/* ***** function validateData() *****
Validates that all form inputs meet basic requirements before
checking business rules. Checks that species contains valid animal,
gender is selected, and name is selected.

Parameters: None

Returns: 
    Boolean - true if all validation passes, false if any validation fails
******************************** */
function validateData() {
    let valid = true;

    // Check if species input is not empty
    if (petSpecies.trim() === "") {
        output("Please enter a species for your pet.");
        valid = false;
        return valid;
    }

    // Convert species to lowercase for case-insensitive checking
    let speciesLower = petSpecies.toLowerCase();

    // Check if species contains "cat", "dog", or "pig"
    if (speciesLower.includes("cat")) {
        actualSpecies = "cat";
    } else if (speciesLower.includes("dog")) {
        actualSpecies = "dog";
    } else if (speciesLower.includes("pig")) {
        actualSpecies = "pig";
    } else {
        // Species not valid
        output("Sorry, that species is not yet in our database.");
        valid = false;
        return valid;
    }

    // Check if gender was selected
    if (petGender === "") {
        output("Please select a gender for your pet.");
        valid = false;
        return valid;
    }

    // Check if name was selected
    if (petName === "") {
        output("Please select a name for your pet.");
        valid = false;
        return valid;
    }

    // All validation passed
    return valid;
}

/* ***** function evaluateAnswers() *****
Evaluates business rules for pet naming based on species, gender, and name.
Checks all naming rules and generates appropriate success or error messages.

Parameters: None

Returns: 
    Boolean - true if all rules pass and pet name is approved, 
              false if any rule is violated
******************************** */
function evaluateAnswers() {
    // Variable to hold the spot comment if name is Spot
    let spotComment = "";

    // RULE 1: Check if name is Whiskers
    if (petName === "Whiskers") {
        // Only cats can be named Whiskers
        if (actualSpecies !== "cat") {
            output(`Your pet ${actualSpecies} does not want to be named Whiskers; that name is only for cats!`);
            return false;
        }
    }

    // RULE 2: Check if name is Porky
    if (petName === "Porky") {
        // Only pigs can be named Porky
        if (actualSpecies !== "pig") {
            output(`Your pet ${actualSpecies} does not want to be named Porky; that name is only for pigs!`);
            return false;
        }

        // If it's a pig, must be male
        if (petGender !== "Male") {
            output(`Sorry, your pig's gender is ${petGender}. Only male pigs want to be named Porky.`);
            return false;
        }
    }

    // RULE 3: Check if name is Daisy
    if (petName === "Daisy") {
        // Only dogs and pigs can be named Daisy
        if (actualSpecies !== "dog" && actualSpecies !== "pig") {
            output("Pets of this species don't want the name Daisy.");
            return false;
        }

        // Must be female or unknown gender
        if (petGender !== "Female" && petGender !== "Unknown") {
            output("Pets of this gender don't want the name Daisy.");
            return false;
        }
    }

    // RULE 4: Check if name is King
    if (petName === "King") {
        // Must be male or unknown gender
        if (petGender !== "Male" && petGender !== "Unknown") {
            output("Pets of this gender don't want the name King.");
            return false;
        }
    }

    // RULE 5: Check if name is Princess
    if (petName === "Princess") {
        // Only cats can be named Princess
        if (actualSpecies !== "cat") {
            output("Pets of this species don't want the name Princess.");
            return false;
        }

        // Must be female
        if (petGender !== "Female") {
            output("Pets of this gender don't want the name Princess.");
            return false;
        }
    }

    // RULE 6: Check if name is Spot (always succeeds but may add comment)
    if (petName === "Spot") {
        // Create appropriate comment based on gender
        if (petGender === "Male") {
            spotComment = " But just to check, does he actually have spots?";
        } else if (petGender === "Female") {
            spotComment = " But just to check, does she actually have spots?";
        } else {
            // Unknown gender
            spotComment = " But just to check, does it actually have spots?";
        }
    }

    // All rules passed - generate success message with correct pronoun
    let pronoun;
    if (petGender === "Male") {
        pronoun = "he";
    } else if (petGender === "Female") {
        pronoun = "she";
    } else {
        pronoun = "it";
    }

    // Output success message
    output(`Congratulations on adopting a new ${actualSpecies}! We are confident ${pronoun} will enjoy being called ${petName}!${spotComment}`);
    
    return true;
}