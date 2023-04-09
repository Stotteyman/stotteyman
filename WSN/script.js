const streamersList = document.getElementById('streamers-list');
const offlineStreamersList = document.getElementById('offline-streamers-list');

async function displayStreamers() {
  const response = await fetch('usernames.txt');
  const usernames = await response.text();

  const streamers = [];
  const offlineStreamers = [];

  for (const username of usernames.trim().split('\n')) {
    const url = `https://kick.com/api/v2/channels/${username.trim()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.channel.online) {
      streamers.push({
        name: data.channel.username,
        viewers: data.channel.current_viewers
      });
    } else {
      offlineStreamers.push({
        name: data.channel.username,
        followers: data.channel.followers
      });
    }
  }

  streamers.sort((a, b) => b.viewers - a.viewers);
  offlineStreamers.sort((a, b) => b.followers - a.followers);

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

  offlineStreamersList.innerHTML = '';
  for (const streamer of offlineStreamers) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerText = `${streamer.name} (${streamer.followers} followers)`;
    a.target = '_blank';
    a.href = `https://kick.com/${streamer.name}`;
    li.appendChild(a);
    offlineStreamersList.appendChild(li);
  }
}

displayStreamers();
