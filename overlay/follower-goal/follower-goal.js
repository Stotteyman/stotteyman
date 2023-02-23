function updateProgressBar() {
  const followerCountElement = document.querySelector('p.stream-title');
  const followerCount = parseInt(followerCountElement.innerText.replace(',', ''));
  const progressBar = document.querySelector('.progress-bar');
  const progressBarWidth = (followerCount / 75) * 100;
  progressBar.style.width = `${progressBarWidth}%`;
  document.querySelector('.progress-bar-text').innerText = `Follower Goal: ${followerCount} / 75`;
}

setInterval(updateProgressBar, 5000); // check for new followers every 5 seconds
