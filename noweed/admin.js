function resetTimestamp() {
    // Reset timestamp to current time
    var timestamp = Math.floor(new Date().getTime() / 1000);
    // Post the timestamp to the main page
    window.opener.postMessage({ timestamp: timestamp }, '*');
}
