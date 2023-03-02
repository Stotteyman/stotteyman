const apiEndpoint = 'https://kick.com/api/v1/channels/432hz';
const followerGoal = 75;

function updateFollowerCount() {
  fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => {
      const currentFollowers = data.followersCount;
      const goalPercentage = Math.floor((currentFollowers / followerGoal) * 100);
      document.getElementById('currentFollowers').textContent = currentFollowers;
      document.getElementById('followerGoal').textContent = followerGoal;
      document.querySelector('.progress-fill').style.width = `${goalPercentage}%`;
    })
    .catch(error => console.error('Error fetching follower count:', error));
}

updateFollowerCount();
setInterval(updateFollowerCount, 60000); // Update every minute
