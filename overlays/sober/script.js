document.addEventListener("DOMContentLoaded", function() {
    // Unix timestamp (1713997329) for April 24, 2024, 15:22:09 PST
    var startDate = new Date(1713997329 * 1000); // Convert Unix timestamp to milliseconds
    var daysCountElement = document.getElementById("daysCount");
    var lastUpdate = startDate.getTime(); // Initialize last update with the start time
    var timeElements = document.querySelectorAll(".time-element");

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
        } else if (months > 0) {
            timeDenomination = months === 1 ? "month" : "months";
        } else if (weeks > 0) {
            timeDenomination = weeks === 1 ? "week" : "weeks";
        } else if (days > 0) {
            timeDenomination = days === 1 ? "day" : "days";
        } else if (hours > 0) {
            timeDenomination = hours === 1 ? "hour" : "hours";
        } else if (minutes > 0) {
            timeDenomination = minutes === 1 ? "minute" : "minutes";
        } else {
            timeDenomination = seconds === 1 ? "second" : "seconds";
        }

        // Update days count text
        var highestNonZeroValue = years || months || weeks || days || hours || minutes || seconds;
        for (var i = 0; i < timeElements.length; i++) {
            var element = timeElements[i];
            if (element.classList.contains(timeDenomination)) {
                element.textContent = highestNonZeroValue + " " + timeDenomination;
                element.style.fontWeight = "bold";
            } else {
                element.textContent = "";
            }
        }
    }

    // Initial call to update days count
    updateDaysCount();

    // Update days count every second
    setInterval(updateDaysCount, 1000);
});
