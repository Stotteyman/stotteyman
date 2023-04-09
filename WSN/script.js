const streamersList = document.getElementById('streamers-list');

async function displayStreamers() {
  const response = await fetch('usernames.txt');
  const usernames = await response.text();

  const streamers = [];

  for (const username of usernames.split('\n')) {
    const url = `https://kick.com/api/v2/channels/${username}`;
    const response = await fetch(url);
    const data = await response.json();

    streamers.push({
      name: data.channel.username,
      viewers: data.channel.current_viewers
    });
  }

  streamers.sort((a, b) => a.name.localeCompare(b.name));

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
