// Get the follower count element
const followerCountElement = document.querySelector('.p-stream-title');

// Get the progress bar element
const progressBarElement = document.querySelector('.progress-bar');

// Get the progress bar text element
const progressBarTextElement = document.querySelector('.progress-bar-text');

// Set the follower goal and current follower count
const followerGoal = 75;
let currentFollowers = parseInt(followerCountElement.textContent);

// Update the progress bar fill and text
function updateProgressBar() {
  // Calculate the percentage of the goal that has been achieved
  const percentage = Math.floor((currentFollowers / followerGoal) * 100);

  // Set the width of the progress bar to the percentage achieved
  progressBarElement.style.width = percentage + '%';

  // Set the text of the progress bar to show the current and goal follower counts
  progressBarTextElement.textContent = `Follower Goal: ${currentFollowers} / ${followerGoal}`;
}

// Call updateProgressBar initially
updateProgressBar();

// Check for updates to the follower count every 5 seconds
setInterval(() => {
  const newFollowers = parseInt(followerCountElement.textContent);

  // Only update the progress bar if the follower count has changed
  if (newFollowers !== currentFollowers) {
    currentFollowers = newFollowers;
    updateProgressBar();
  }
}, 5000);
