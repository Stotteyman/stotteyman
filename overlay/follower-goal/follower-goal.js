// Set the follower goal and current follower count
const followerGoal = 75;
let currentCount = 36;

// Get the progress bar and text elements
const progressBar = document.getElementById("progress-bar");
const followerCount = document.getElementById("follower-count");
const progressText = document.getElementById("progress-text");

// Set the progress text to the current follower count
followerCount.textContent = currentCount;

// Calculate the progress percentage
const progressPercent = (currentCount / followerGoal) * 100;

// Update the progress bar and text
progressBar.style.color = "#FFA500";
progressBar.style.width = progressPercent + "%";
progressText.style.color = "#FFA500";
progressText.textContent = "Follower Goal: " + currentCount + " / " + followerGoal;
