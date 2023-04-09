const streamersList = document.querySelector('#streamers-list');

fetch('usernames.txt')
  .then(response => response.text())
  .then(usernames => {
    const namesArray = usernames.trim().split('\n');
    const onlineStreams = [];
    const offlineStreams = [];

    namesArray.forEach(name => {
      fetch(`https://kick.com/api/v2/channels/${name}`)
        .then(response => response.json())
        .then(channel => {
          if (channel.is_live) {
            onlineStreams.push(channel);
          } else {
            offlineStreams.push(channel);
          }

          // Sort online streamers by viewers
          onlineStreams.sort((a, b) => b.viewers - a.viewers);

          // Sort offline streamers by followers
          offlineStreams.sort((a, b) => b.followers - a.followers);

          // Clear the current list
          streamersList.innerHTML = '';

          // Add the online streamers to the list
          onlineStreams.forEach(stream => {
            const streamer = document.createElement('li');
            const link = document.createElement('a');
            link.href = `https://kick.com/${stream.username}`;
            link.target = '_blank';
            link.innerText = `${stream.username} - ${stream.viewers} viewers`;
            streamer.appendChild(link);
            streamersList.appendChild(streamer);
          });

          // Add the offline streamers to the list
          offlineStreams.forEach(stream => {
            const streamer = document.createElement('li');
            const link = document.createElement('a');
            link.href = `https://kick.com/${stream.username}`;
            link.target = '_blank';
            link.innerText = `${stream.username} - ${stream.followers} followers`;
            streamer.appendChild(link);
            document.querySelector('#streamers-offline').appendChild(streamer);
          });
        })
        .catch(error => console.error(`Error fetching channel data for ${name}: ${error}`));
    });
  })
  .catch(error => console.error(`Error fetching usernames: ${error}`));
