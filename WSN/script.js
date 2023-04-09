const streamersList = document.getElementById('streamers-list');

async function displayStreamers() {
  const response = await fetch('usernames.txt');
  const usernames = await response.text();

  const streamers = [];

  for (const username of usernames.trim().split('\n')) {
    const url = `https://kick.com/api/v2/channels/${username.trim()}`;
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
    const a = document.createElement('a');
    a.innerText = `${streamer.name} (${streamer.viewers} viewers)`;
    a.target = '_blank';
    a.href = `https://kick.com/${streamer.name}`;
    li.appendChild(a);
    streamersList.appendChild(li);
  }
}

displayStreamers();
