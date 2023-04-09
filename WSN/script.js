const streamersList = document.getElementById("streamers-list");

// Retrieve the list of usernames from usernames.txt
fetch("usernames.txt")
  .then(response => response.text())
  .then(data => {
    // Split the text into an array of usernames
    const usernames = data.split("\n").filter(username => username.trim() !== "");
    // Sort the usernames by follower count (most to least)
    usernames.sort((a, b) => {
      return getFollowerCount(b) - getFollowerCount(a);
    });
    // Loop through each username and add it to the list
    usernames.forEach(username => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      const image = document.createElement("img");
      // Set the link and image attributes
      link.textContent = username;
      link.href = `https://kick.com/${username}`;
      link.target = "_blank";
      image.src = "";
      image.alt = `${username}'s profile picture`;
      // Get the follower count and profile picture for the streamer
      getFollowerCount(username).then(followerCount => {
        const followerCountSpan = document.createElement("span");
        followerCountSpan.textContent = ` (${followerCount} followers)`;
        link.appendChild(followerCountSpan);
        getProfilePicture(username).then(profilePicture => {
          if (profilePicture) {
            image.src = profilePicture;
          } else {
            image.src = "default_profile_pic.png";
          }
          link.insertBefore(image, followerCountSpan);
        }).catch(error => {
          console.error(error);
          image.src = "default_profile_pic.png";
          link.insertBefore(image, followerCountSpan);
        });
      }).catch(error => console.error(error));
      listItem.appendChild(link);
      streamersList.appendChild(listItem);
    });
  })
  .catch(error => console.error(error));

function getFollowerCount(username) {
  return fetch(`https://kick.com/api/v2/channels/${username}`)
    .then(response => response.json())
    .then(data => {
      return data.followers_count;
    })
    .catch(error => {
      console.error(error);
      return 0;
    });
}

function getProfilePicture(username) {
  return fetch(`https://kick.com/api/v2/channels/${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.profile_pic) {
        return data.profile_pic.replace(/\\/g, "");
      } else {
        return null;
      }
    })
    .catch(error => {
      console.error(error);
      return null;
    });
}
