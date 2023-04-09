const streamersList = document.getElementById("streamers-list");

// Retrieve the list of usernames from usernames.txt
fetch("usernames.txt")
  .then(response => response.text())
  .then(data => {
    // Split the text into an array of usernames
    const usernames = data.split("\n").filter(username => username.trim() !== "");
    // Get the follower count and live status for each streamer and create an array of objects with the username, follower count, and live status
    const promises = usernames.map(username => {
      return fetch(`https://kick.com/api/v2/channels/${username}`)
        .then(response => response.json())
        .then(data => {
          return {
            username,
            followers: data.followers_count,
            live: data.live,
            viewcount: data.viewcount
          };
        })
        .catch(error => console.error(error));
    });
    // Wait for all the promises to resolve and then sort the array of objects by live status and viewcount, and then by follower count for offline streamers
    Promise.all(promises)
      .then(streamers => {
        streamers.sort((a, b) => {
          if (a.live && !b.live) {
            return -1;
          } else if (!a.live && b.live) {
            return 1;
          } else if (a.live && b.live) {
            return b.viewcount - a.viewcount;
          } else {
            return b.followers - a.followers;
          }
        });
        // Loop through each streamer and add it to the list
        streamers.forEach(streamer => {
          const listItem = document.createElement("li");
          const link = document.createElement("a");
          link.textContent = streamer.username;
          link.href = `https://kick.com/${streamer.username}`;
          link.target = "_blank";
          const followerCount = document.createElement("span");
          followerCount.textContent = ` (${streamer.followers} followers)`;
          const liveStatus = document.createElement("span");
          liveStatus.textContent = streamer.live ? " LIVE" : "";
          liveStatus.style.color = streamer.live ? "green" : "red";
          listItem.appendChild(liveStatus);
          listItem.appendChild(link);
          listItem.appendChild(followerCount);
          streamersList.appendChild(listItem);
        });
      })
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
