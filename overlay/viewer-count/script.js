const viewerCountUrl = 'https://www.kick.com/polyanmon';

const xhr = new XMLHttpRequest();
xhr.open('GET', viewerCountUrl);
xhr.onload = () => {
  if (xhr.status === 200) {
    const responseHtml = xhr.response;
    const parser = new DOMParser();
    const responseDoc = parser.parseFromString(responseHtml, 'text/html');
    const viewerCount = responseDoc.querySelector('.odometer-value').textContent.trim();
    const viewerCountElement = document.querySelector('.odometer-value');
    viewerCountElement.textContent = viewerCount;
  } else {
    console.error('Failed to fetch viewer count:', xhr.statusText);
  }
};
xhr.onerror = () => {
  console.error('Failed to fetch viewer count.');
};
xhr.send();
