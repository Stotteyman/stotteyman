document.addEventListener("DOMContentLoaded", function() {
    // Start timestamp
    var startDate = new Date('2024-04-24T00:34:28'); // Example start date
    var daysCountElement = document.getElementById("daysCount");

    // Update days count function
    function updateDaysCount() {
        var currentDate = new Date();
        var timeDifference = currentDate.getTime() - startDate.getTime();
        var daysCount = Math.round(timeDifference / (1000 * 60 * 60 * 24)); // Round to nearest whole number
        daysCountElement.textContent = daysCount + " days";
    }

    // Initial call to update days count
    updateDaysCount();

    // Update days count every 24 hours
    setInterval(updateDaysCount, 24 * 60 * 60 * 1000);
});
