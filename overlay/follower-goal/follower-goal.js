const followerGoal = 75;

function updateProgressBar() {
  const followerCountElement = document.querySelector('.p.stream-title');
  const followerCount = parseInt(followerCountElement.innerText);

  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');

  const percentage = Math.min((followerCount / followerGoal) * 100, 100);
  progressBar.style.width = `${percentage}%`;
  progressText.innerText = `Follower Goal: ${followerCount} / ${followerGoal}`;
}

updateProgressBar();
setInterval(updateProgressBar, 1000);
