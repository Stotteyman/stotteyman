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
    var titleElement = document.getElementById("title");

    // Convert timestamp to Date object
    var date = new Date(timestamp * 1000);

    // Format date to display in PST
    var options = { timeZone: 'America/Los_Angeles', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
