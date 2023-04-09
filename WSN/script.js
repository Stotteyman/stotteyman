const streamersList = document.getElementById('streamers-list');

// Function to fetch data from API and display the streamers list
async function displayStreamers() {
  const response = await fetch('usernames.txt');
  const usernames = await response.text();

  const streamers = [];

  // Loop through each username and fetch the data from API
  for (const username of usernames.split('\n')) {
    if (!username) continue;

    const url = `https://kick.com/api/v2/channels/${username.trim()}`;
    const response = await fetch(url);
    const data = await response.json();

    streamers.push({
      name: data.username,
      viewers: data.current_viewers,
      lastOnline: new Date(data.last_online).getTime()
    });
  }

  // Sort the streamers list by last online time
  streamers.sort((a, b) => b.lastOnline - a.lastOnline);

  // Display the streamers list
  streamersList.innerHTML = '';
  for (const streamer of streamers) {
    const li = document.createElement('li');
    li.innerText = `${streamer.name} (${streamer.viewers} viewers)`;
    li.addEventListener('click', () => {
      window.location.href = `https://kick.com/${streamer.name}`;
    });
    streamersList.appendChild(li);
  }
}

displayStreamers();
