// Sample list of streamers
const streamers = ['user1', 'user2', 'user3', 'user4', 'user5'];

// Sample object representing streamer status (online/offline)
const streamerStatus = {
  user1: 'offline',
  user2: 'online',
  user3: 'offline',
  user4: 'online',
  user5: 'online'
};

// Sort streamers alphabetically
streamers.sort();

// Sort streamers by status (online/offline)
streamers.sort((a, b) => {
  const statusA = streamerStatus[a];
  const statusB = streamerStatus[b];
  if (statusA === 'online' && statusB === 'offline') {
    return -1;
  } else if (statusA === 'offline' && statusB === 'online') {
    return 1;
  } else {
    return 0;
  }
});

// Display streamers in the HTML
const streamersList = document.getElementById('streamers-list');
streamers.forEach(streamer => {
  const status = streamerStatus[streamer];
  const listItem = document.createElement('li');
  listItem.textContent = streamer;
  if (status === 'online') {
    listItem.classList.add('online');
  } else {
    listItem.classList.add('offline');
  }
  streamersList.appendChild(listItem);
});
