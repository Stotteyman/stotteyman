document.addEventListener("DOMContentLoaded", function() {
    // Start timestamp
    var startDate = new Date('2024-04-24T00:34:28'); // Example start date
    var daysCountElement = document.getElementById("daysCount");
    var lastDayUpdated = startDate.getDate(); // Initialize last day updated with the start date

    // Update days count function
    function updateDaysCount() {
        var currentDate = new Date();
        var currentDay = currentDate.getDate(); // Get the current day of the month

        // Check if a full day has passed since the last update
        if (currentDay !== lastDayUpdated) {
            var daysCount = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); // Calculate days count
            daysCountElement.textContent = daysCount + " days"; // Update days count
            lastDayUpdated = currentDay; // Update last day updated
        }
    }

    // Initial call to update days count
    updateDaysCount();

    // Update days count every minute to check if a full day has passed
    setInterval(updateDaysCount, 60000); // Check every minute
});
