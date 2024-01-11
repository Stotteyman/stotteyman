document.addEventListener("DOMContentLoaded", function() {
    var croagDayElement = document.getElementById("croagDay");

    // Get the current day of the year
    var today = new Date();
    var startOfYear = new Date(today.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));

    // Display the message
    croagDayElement.innerText = "Today is Croag 2024 Day " + dayOfYear;
});
