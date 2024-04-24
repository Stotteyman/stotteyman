document.addEventListener("DOMContentLoaded", function() {
    // Unix timestamp (1713997329) for April 24, 2024, 15:22:09 PST
    var startDate = new Date(1713997329 * 1000); // Convert Unix timestamp to milliseconds
    var daysCountElement = document.getElementById("daysCount");
    var lastUpdate = startDate.getTime(); // Initialize last update with the start time
    var daysCount = 0; // Initialize days count to 0

    // Update days count function
    function updateDaysCount() {
        var currentTime = new Date().getTime();

        // Check if a full day has passed since the last update
        if (currentTime - lastUpdate >= 24 * 60 * 60 * 1000) {
            daysCount++; // Increment days count
            lastUpdate = currentTime; // Update last update time
        }

        // Update days count text
        daysCountElement.textContent = daysCount === 0 ? "0 days" : (daysCount === 1 ? "1 day" : daysCount + " days");
    }

    // Initial call to update days count
    updateDaysCount();

    // Update days count every minute to check if a full day has passed
    setInterval(updateDaysCount, 60000); // Check every minute
});
