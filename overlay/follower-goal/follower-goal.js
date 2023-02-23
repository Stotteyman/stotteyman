// Find the follower count element on the channel page
const followerCountElement = document.querySelector('p.stream-title');

// Get the current follower count from the follower count element
const currentFollowers = parseInt(followerCountElement.textContent);

// Calculate the progress as a percentage of the goal
const progress = (currentFollowers / 75) * 100;

// Find the progress bar and set its width to the calculated progress
const progressBar = document.getElementById('progress-bar');
progressBar.style.width = progress + '%';

// Update the follower count text
const followerCountText = document.getElementById('follower-count');
followerCountText.textContent = currentFollowers;
