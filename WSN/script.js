const streamersList = document.getElementById('streamers-list');

async function displayStreamers() {
  const response = await fetch('usernames.txt');
  const usernames = await response.text();

  const streamers = usernames.trim().split('\n');

  streamersList.innerHTML = '';
  for (const streamer of streamers) {
    const li = document.createElement('li');
    li.innerText = streamer;
    streamersList.appendChild(li);
  }
}

displayStreamers();
