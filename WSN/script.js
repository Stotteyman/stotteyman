const streamersList = document.getElementById("streamers-list");

// Retrieve the list of usernames from usernames.txt
fetch("usernames.txt")
  .then(response => response.text())
  .then(data => {
    // Split the text into an array of usernames
    const usernames = data.split("\n").filter(username => username.trim() !== "");
    // Sort the usernames alphabetically
    usernames.sort();
    // Loop through each username and add it to the list
    usernames.forEach(username => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = username;
      link.href = `https://kick.com/${username}`;
      link.target = "_blank";
      listItem.appendChild(link);
      streamersList.appendChild(listItem);
    });
  })
  .catch(error => console.error(error));
