// define an array of beats with their properties
const beats = [
    {
      title: "Beat 1",
      image: "beat1.jpg",
      audio: "beat1.mp3",
      price: "$20",
      link: "https://www.google.com"
    },
    {
      title: "Beat 2",
      image: "beat2.jpg",
      audio: "beat2.mp3",
      price: "$25",
      link: "https://www.google.com"
    },
    {
      title: "Beat 3",
      image: "beat3.jpg",
      audio: "beat3.mp3",
      price: "$30",
      link: "https://www.google.com"
    }
  ];
  
  // get the beat container element
  const beatContainer = document.querySelector('.beat-container');
  
  // loop through the beats array and create the beat boxes
  beats.forEach((beat) => {
    // create the beat box element
    const beatBox = document.createElement('div');
    beatBox.classList.add('beat-box');
  
    // create the beat title element
    const beatTitle = document.createElement('h2');
    beatTitle.classList.add('beat-title');
    beatTitle.textContent = beat.title;
  
    // create the beat image element
    const beatImg = document.createElement('img');
    beatImg.classList.add('beat-img');
    beatImg.src = beat.image;
  
    // create the beat audio player element
    const beatPlayer = document.createElement('audio');
    beatPlayer.classList.add('beat-player');
    beatPlayer.controls = true;
    beatPlayer.innerHTML = `<source src="${beat.audio}" type="audio/mp3">`;
  
    // create the buy button element
    const buyButton = document.createElement('a');
    buyButton.classList.add('buy-button');
    buyButton.href = beat.link;
    buyButton.textContent = `Buy Now (${beat.price})`;
  
    // add the elements to the beat box
    beatBox.appendChild(beatTitle);
    beatBox.appendChild(beatImg);
    beatBox.appendChild(beatPlayer);
    beatBox.appendChild(buyButton);
  
    // add the beat box to the beat container
    beatContainer.appendChild(beatBox);
  });
  