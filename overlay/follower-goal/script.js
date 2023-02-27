const apiEndpoint = 'https://kick.com/api/v1/channels/stotteyman';
const followerGoal = 200;

function updateFollowerCount() {
  fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => {
      const currentFollowers = data.followersCount;
      const goalPercentage = Math.floor((currentFollowers / followerGoal) * 100);
      document.querySelector('.current-followers').textContent = `Followers: ${currentFollowers}/${followerGoal}`;
      document.querySelector('.goal-percentage').textContent = `${goalPercentage}%`;
      document.querySelector('.progress-fill').style.width = `${goalPercentage}%`;
    })
    .catch(error => console.error('Error fetching follower count:', error));
}

updateFollowerCount();
setInterval(updateFollowerCount, 60000); // Update every minute
