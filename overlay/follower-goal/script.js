let goal = document.querySelector(".progress-text");
let progressBar = document.querySelector(".progress-bar");

function updateFollowerCount() {
    fetch("https://kick.com/api/v1/channels/stotteyman")
    .then(response => response.json())
    .then(data => {
        let currentFollowers = data.followersCount;
        let percentComplete = currentFollowers / 2;
        goal.innerHTML = currentFollowers + "/200 (" + percentComplete + "%)";
        progressBar.style.width = percentComplete + "%";
    })
    .catch(error => console.log(error));
}

// Fetch data initially and then every 10 seconds
updateFollowerCount();
setInterval(updateFollowerCount, 10000);
