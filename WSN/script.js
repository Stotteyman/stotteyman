const streamersList = document.getElementById("streamers-list");

// Retrieve the list of usernames from usernames.txt
fetch("usernames.txt")
  .then(response => response.text())
  .then(data => {
    // Split the text into an array of usernames
    const usernames = data.split("\n").filter(username => username.trim() !== "");
    // Get the follower count for each streamer and create an array of objects with the username and follower count
    const promises = usernames.map(username => {
      return fetch(`https://kick.com/api/v2/channels/${username}`)
        .then(response => response.json())
        .then(data => {
          return {
            username,
            followers: data.followers_count
          };
        })
        .catch(error => console.error(error));
    });
    // Wait for all the promises to resolve and then sort the array of objects by follower count
    Promise.all(promises)
      .then(streamers => {
        streamers.sort((a, b) => b.followers - a.followers);
        // Loop through each streamer and add it to the list
        streamers.forEach(streamer => {
          const listItem = document.createElement("li");
          const link = document.createElement("a");
          link.textContent = streamer.username;
          link.href = `https://kick.com/${streamer.username}`;
          link.target = "_blank";
          const followerCount = document.createElement("span");
          followerCount.textContent = ` (${streamer.followers} followers)`;
          listItem.appendChild(link);
          listItem.appendChild(followerCount);
          streamersList.appendChild(listItem);
        });
        // Add event listener to each list item
        const listItems = document.querySelectorAll(".streamers-list li");
        listItems.forEach(item => {
          item.addEventListener("click", () => {
            window.location.href = `https://kick.com/${item.firstChild.textContent}`;
          });
        });
      })
      .catch(error => console.error(error));
  })
  .catch(error => console.error(error));
