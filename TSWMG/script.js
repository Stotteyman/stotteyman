document.addEventListener("DOMContentLoaded", function () {
    // Check if the livestream is live using the provided API
    fetch('https://kick.com/api/v2/channels/inslimewetrustlive')
        .then(response => response.json())
        .then(data => {
            if (data.isLive) {
                // Show the livestream container and embed the livestream window
                document.getElementById('livestream-container').style.display = 'block';
                document.getElementById('livestream-container').innerHTML = '<iframe src="https://kick.com/inslimewetrust" width="100%" height="400px"></iframe>';
            }
        })
        .catch(error => console.error('Error checking livestream status:', error));
});
