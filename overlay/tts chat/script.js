$(document).ready(function() {
    var chatWindow = $('#chat-window');
    var startTTSButton = $('#start-tts');
    var ivona = new Ivona({
      accessKey: 'YOUR_ACCESS_KEY',
      secretKey: 'YOUR_SECRET_KEY'
    });
  
    // Retrieve chat messages from the specified URL
    setInterval(function() {
      $.get('https://kick.com/stotteyman/chatroom', function(data) {
        chatWindow.html(data);
      });
    }, 1000);
  
    // Start TTS functionality when the button is clicked
    startTTSButton.click(function() {
      var messages = chatWindow.find('.message');
      var currentMessageIndex = 0;
      
      // Speak each message using the Ivona TTS API
      function speakNextMessage() {
        var message = $(messages[currentMessageIndex]).text();
        ivona.speak(message, { voiceName: 'Salli', volume: 1.0 }).on('play', function() {
          currentMessageIndex++;
          if (currentMessageIndex < messages.length) {
            speakNextMessage();
          }
        });
      }
  
      speakNextMessage();
    });
  });
  