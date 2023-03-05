const productContainer = document.querySelector('.product-container');

// Function to create a product tile
function createProductTile(title, price, artUrl, playUrl, buyUrl) {
  const productTile = document.createElement('div');
  productTile.classList.add('product-tile');
  
  const productArt = document.createElement('div');
  productArt.classList.add('product-art');
  productArt.style.backgroundImage = `url(${artUrl})`;
  
  const productTitle = document.createElement('div');
  productTitle.classList.add('product-title');
  productTitle.innerText = title;
  
  const productPrice = document.createElement('div');
  productPrice.classList.add('product-price');
  productPrice.innerText = `$${price}`;
  
  const productPlayButton = document.createElement('button');
  productPlayButton.classList.add('product-button', 'product-play-button');
  productPlayButton.innerText = 'Play';
  productPlayButton.addEventListener('click', () => {
    // Code to play the beat
    console.log(`Playing ${playUrl}`);
  });
  
  const productBuyButton = document.createElement('button');
  productBuyButton.classList.add('product-button', 'product-buy-button');
  productBuyButton.innerText = 'Buy';
  productBuyButton.addEventListener('click', () => {
    // Code to buy the beat
    console.log(`Buying ${buyUrl}`);
  });
  
  productTile.appendChild(productArt);
  productTile.appendChild(productTitle);
  productTile.appendChild(productPrice);
  productTile.appendChild(productPlayButton);
  productTile.appendChild(productBuyButton);
  
  return productTile;
}

// Code to read the files in the /beats/ folder and create product tiles
fetch('/beats/')
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(data, 'text/html');
    const links = htmlDoc.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const filename = link.getAttribute('href');
      if (filename.endsWith('.mp3')) {
        const title = filename.slice(0, -4); // remove '.mp3' extension
        const price = Math.floor(Math.random() * 50) + 10; // generate random price between 10 and 60
        const artUrl = `/beats/${title}.jpg`;
        const playUrl = `/beats/${filename}`;
        const buyUrl = `/buy/${title}`;
        const productTile = createProductTile(title, price, artUrl, playUrl, buyUrl);
        productContainer.appendChild(productTile);
      }
    }
  });
