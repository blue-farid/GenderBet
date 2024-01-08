// Constants
const GENDER_API_URL = "https://api.genderize.io/?name=";

// When the document is fully loaded, execute the following
document.addEventListener("DOMContentLoaded", () => {
    // State object to manage form data
    let formData = {
        name: '',
        gender: undefined
    };

    // Elements in the DOM
    const elements = {
        nameInput: document.getElementById("name"),
        genderForm: document.getElementById("form"),
        saveButton: document.getElementById("save"),
        displayGender: document.getElementById("gender-txt"),
        displayProbability: document.getElementById("gender-val"),
        savedInfo: document.getElementById("saved-answer"),
        clearButton: document.getElementById("clear"),
        errorDisplay: document.getElementById("error")
    };

    // Attach event listeners to form elements
    elements.nameInput.addEventListener("input", handleNameChange);
    elements.genderForm.addEventListener("change", handleGenderSelection);
    elements.genderForm.addEventListener("submit", processFormSubmission);
    elements.saveButton.addEventListener("click", saveGenderInfo);
    elements.clearButton.addEventListener("click", clearSavedInfo);

    // Handle name input changes
    function handleNameChange(event) {
        formData.name = event.target.value.trim();
    }

    // Update gender selection from radio buttons
    function handleGenderSelection() {
        formData.gender = document.querySelector('input[name="gender"]:checked')?.value;
    }

// Fetch gender data from the API using Promises
    function getGenderData(name) {
        return fetch(`${GENDER_API_URL}${name}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                return response.json();
            });
    }

// Process form submission using Promise handling
    function processFormSubmission(event) {
        event.preventDefault();
        clearErrorMessage();

        if (!isNameValid(formData.name)) {
            return; // Stop if name is not valid
        }

        displayLoading(true);
        getGenderData(formData.name)
            .then(genderData => {
                updateGenderDisplay(genderData);
                refreshSavedDataDisplay(formData.name);
            })
            .catch(error => {
                showErrorMessage(error.message);
            })
            .finally(() => {
                displayLoading(false);
            });
    }

    // Save gender info to local storage
    function saveGenderInfo() {
        if (formData.name && formData.gender) {
            localStorage.setItem(formData.name, formData.gender);
            elements.savedInfo.textContent = `Saved: ${formData.gender}`;
            clearErrorMessage();
        } else {
            showErrorMessage("Please complete the form before saving.");
        }
    }

    // Clear saved information
    function clearSavedInfo() {
        if (localStorage.getItem(formData.name)) {
            localStorage.removeItem(formData.name);
            elements.savedInfo.textContent = "Cleared";
            clearErrorMessage();
        }
    }

    // Update the display with gender data
    function updateGenderDisplay({ gender, probability }) {
        elements.displayGender.textContent = `${gender}` || "Unavailable";
        elements.displayProbability.textContent = `${(probability * 100).toFixed(2)}%` || "0%";
    }

    // Refresh the display of saved data
    function refreshSavedDataDisplay(name) {
        elements.savedInfo.textContent = localStorage.getItem(name) || "No data";
    }

    // Toggle loading state display
    function displayLoading(isLoading) {
        if (isLoading) {
            elements.displayGender.textContent = "Loading...";
            elements.displayProbability.textContent = "Loading...";
        }
    }

    // Show error messages
    function showErrorMessage(message) {
        elements.errorDisplay.textContent = message;
        elements.errorDisplay.style.display = message ? 'block' : 'none';
    }

    // Clear any displayed error messages
    function clearErrorMessage() {
        showErrorMessage('');
    }

    // Validate the name input
    function isNameValid(name) {
        const valid = /^[a-zA-Z]{1,254}$/.test(name);
        if (!valid) {
            showErrorMessage("Name should only contain letters and be less than 255 characters.");
        }
        return valid;
    }
});
