document.addEventListener("DOMContentLoaded", function () {
    // Get references to the divs and buttons
    var gdpMapDiv = document.getElementById("gdpMapDiv");
    var priceMapDiv = document.getElementById("priceMapDiv");
    var gdpButton = document.getElementById("gdpButton");
    var priceButton = document.getElementById("priceButton");

    // Add click event listeners to the buttons
    gdpButton.addEventListener("click", function () {
        // Show GDP Map Div, hide Price Map Div
        gdpMapDiv.style.display = "none";
        priceMapDiv.style.display = "block";
    });

    priceButton.addEventListener("click", function () {
        // Show Price Map Div, hide GDP Map Div
        priceMapDiv.style.display = "none";
        gdpMapDiv.style.display = "block";
    });
});