// Function to get the online status of a streamer
async function getStreamerStatus(username) {
    const apiUrl = `https://kick.com/api/v2/channels/${username}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.is_live === true) {
      return true;
    } else {
      return false;
    }
  }
  
  // Function to sort streamers by last online status
  async function sortStreamersByLastOnline(streamers) {
    const statusPromises = streamers.map(getStreamerStatus);
    const statuses = await Promise.all(statusPromises);
    streamers.sort((a, b) => {
      const statusA = statuses[streamers.indexOf(a)];
      const statusB = statuses[streamers.indexOf(b)];
      if (statusA === true && statusB === false) {
        return -1;
      } else if (statusA === false && statusB === true) {
        return 1;
      } else {
        const apiUrlA = `https://kick.com/api/v2/channels/${a}`;
        const apiUrlB = `https://kick.com/api/v2/channels/${b}`;
        const responseA = fetch(apiUrlA);
        const responseB = fetch(apiUrlB);
        const dataA = await responseA.json();
        const dataB = await responseB.json();
        const lastLiveTimeA = new Date(dataA.last_live_at);
        const lastLiveTimeB = new Date(dataB.last_live_at);
        return lastLiveTimeB - lastLiveTimeA;
      }
    });
  }
  
  // Function to display streamers in the HTML
  async function displayStreamers(streamers) {
    const streamersList = document.getElementById('streamers-list');
    for (const streamer of streamers) {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = streamer;
      link.href = `https://kick.com/${streamer}`;
      const isOnline = await getStreamerStatus(streamer);
      if (isOnline === true) {
        listItem.classList.add('online');
      } else {
        listItem.classList.add('offline');
      }
      listItem.appendChild(link);
      streamersList.appendChild(listItem);
    }
  }
  
  // Load streamers from usernames.txt
  async function loadStreamers() {
    const response = await fetch('usernames.txt');
    const text = await response.text();
    const streamers = text.split('\n').filter(username => username !== '');
    await sortStreamersByLastOnline(streamers);
    await displayStreamers(streamers);
  }
  
  loadStreamers();
  