let goal = document.getElementById("goal");

function updateFollowerCount() {
    fetch("https://api.example.com/follower-count") // replace with the actual URL
    .then(response => response.json())
    .then(data => {
        let currentFollowers = data.followersCount;
        goal.innerHTML = currentFollowers + "/200";
    })
    .catch(error => console.log(error));
}

// Fetch data initially and then every 10 seconds
updateFollowerCount();
setInterval(updateFollowerCount, 10000);
