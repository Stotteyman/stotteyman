document.addEventListener("DOMContentLoaded", function() {
    var timestamp = 1713944068;
    var timeSinceElement = document.getElementById("timeSince");
    var secondsElement = document.getElementById("seconds");
    var minutesElement = document.getElementById("minutes");
    var hoursElement = document.getElementById("hours");
    var daysElement = document.getElementById("days");
    var weeksElement = document.getElementById("weeks");
    var monthsElement = document.getElementById("months");
    var yearsElement = document.getElementById("years");
    var timestampDisplay = document.getElementById("timestamp");

    // Convert timestamp to Date object
    var date = new Date(timestamp * 1000);

    // Format date to display in PST
    var options = { timeZone: 'America/Los_Angeles', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    var dateString = date.toLocaleString('en-US', options);
    timestampDisplay.textContent = dateString + ' PST';

    function updateTimeSince() {
        var currentTime = new Date().getTime() / 1000;
        var timeDifference = currentTime - timestamp;

        var secondsSince = Math.floor(timeDifference % 60);
        var minutesSince = Math.floor((timeDifference / 60) % 60);
        var hoursSince = Math.floor((timeDifference / (60 * 60)) % 24);
        var daysSince = Math.floor(timeDifference / (60 * 60 * 24));
        var weeksSince = Math.floor(timeDifference / (60 * 60 * 24 * 7));
        var monthsSince = Math.floor(timeDifference / (60 * 60 * 24 * 30.44)); // Average month length
        var yearsSince = Math.floor(timeDifference / (60 * 60 * 24 * 365.25)); // Average year length

        secondsElement.textContent = secondsSince;
        minutesElement.textContent = minutesSince;
        hoursElement.textContent = hoursSince;
        daysElement.textContent = daysSince;
        weeksElement.textContent = weeksSince;
        monthsElement.textContent = monthsSince;
        yearsElement.textContent = yearsSince;
    }

    updateTimeSince();
    setInterval(updateTimeSince, 1000); // Update every second
});
