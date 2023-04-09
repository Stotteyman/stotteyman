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
  
  // Function to sort streamers alphabetically
  function sortStreamersAlphabetically(streamers) {
    streamers.sort();
  }
  
  // Function to sort streamers by online status
  async function sortStreamersByStatus(streamers) {
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
        return 0;
      }
    });
  }
  
  // Function to display streamers in the HTML
  function displayStreamers(streamers) {
    const streamersList = document.getElementById('streamers-list');
    streamers.forEach(async streamer => {
      const isOnline = await getStreamerStatus(streamer);
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = streamer;
      link.href = `https://kick.com/${streamer}`;
      if (isOnline === true) {
        listItem.classList.add('online');
      } else {
        listItem.classList.add('offline');
      }
      listItem.appendChild(link);
      streamersList.appendChild(listItem);
    });
  }
  
  // Load streamers from usernames.txt
  async function loadStreamers() {
    const response = await fetch('usernames.txt');
    const data = await response.text();
    const streamers = data.split('\n').filter(Boolean);
    await sortStreamersByStatus(streamers);
    displayStreamers(streamers);
  }
  
  // Call the loadStreamers function when the page is loaded
  window.addEventListener('load', loadStreamers);
  