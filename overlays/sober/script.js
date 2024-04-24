document.addEventListener("DOMContentLoaded", function() {
    // Unix timestamp (1713997329) for April 24, 2024, 15:22:09 PST
    var startDate = new Date(1713997329 * 1000); // Convert Unix timestamp to milliseconds
    var daysCountElement = document.getElementById("daysCount");

    // Update days count function
    function updateDaysCount() {
        var currentTime = new Date().getTime();
        var timeDifference = currentTime - startDate.getTime();
        
        var years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
        var months = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        var weeks = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24 * 7));
        var days = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
        
        var timeDenomination = "";

        // Determine the highest non-zero time denomination
        if (years > 0) {
            timeDenomination = years === 1 ? "year" : "years";
            daysCountElement.textContent = years + " " + timeDenomination;
        } else if (months > 0) {
            timeDenomination = months === 1 ? "month" : "months";
            daysCountElement.textContent = months + " " + timeDenomination;
        } else if (weeks > 0) {
            timeDenomination = weeks === 1 ? "week" : "weeks";
            daysCountElement.textContent = weeks + " " + timeDenomination;
        } else if (days > 0) {
            timeDenomination = days === 1 ? "day" : "days";
            daysCountElement.textContent = days + " " + timeDenomination;
        } else if (hours > 0) {
            timeDenomination = hours === 1 ? "hour" : "hours";
            daysCountElement.textContent = hours + " " + timeDenomination;
        } else if (minutes > 0) {
            timeDenomination = minutes === 1 ? "minute" : "minutes";
            daysCountElement.textContent = minutes + " " + timeDenomination;
        } else {
            timeDenomination = seconds === 1 ? "second" : "seconds";
            daysCountElement.textContent = seconds + " " + timeDenomination;
        }
    }

    // Initial call to update days count
    updateDaysCount();

    // Update days count every second
    setInterval(updateDaysCount, 1000);
});
