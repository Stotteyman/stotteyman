document.addEventListener("DOMContentLoaded", function() {
    var timestamp = 1713997329;
    var timeSinceElement = document.getElementById("timeSince");
    var yearsElement = document.getElementById("years");
    var monthsElement = document.getElementById("months");
    var weeksElement = document.getElementById("weeks");
    var daysElement = document.getElementById("days");
    var hoursElement = document.getElementById("hours");
    var minutesElement = document.getElementById("minutes");
    var secondsElement = document.getElementById("seconds");
    var timestampDisplay = document.getElementById("timestamp");

    function updateTimeSince() {
        var currentTime = new Date().getTime() / 1000;
        var timeDifference = currentTime - timestamp;

        var yearsSince = Math.floor(timeDifference / (60 * 60 * 24 * 365.25));
        var monthsSince = Math.floor((timeDifference % (60 * 60 * 24 * 365.25)) / (60 * 60 * 24 * 30.44));
        var weeksSince = Math.floor((timeDifference % (60 * 60 * 24 * 30.44)) / (60 * 60 * 24 * 7));
        var daysSince = Math.floor((timeDifference % (60 * 60 * 24 * 7)) / (60 * 60 * 24));
        var hoursSince = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
        var minutesSince = Math.floor((timeDifference % (60 * 60)) / 60);
        var secondsSince = Math.floor(timeDifference % 60);

        yearsElement.textContent = yearsSince;
        monthsElement.textContent = monthsSince;
        weeksElement.textContent = weeksSince;
        daysElement.textContent = daysSince;
        hoursElement.textContent = hoursSince;
        minutesElement.textContent = minutesSince;
        secondsElement.textContent = secondsSince;

        // Update the timestamp in human-readable format
        var date = new Date(timestamp * 1000);
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
        var localDateString = date.toLocaleString(navigator.language, options);
        timestampDisplay.textContent = "Last updated: " + localDateString;
    }

    updateTimeSince();
    setInterval(updateTimeSince, 1000); // Update every second
});
