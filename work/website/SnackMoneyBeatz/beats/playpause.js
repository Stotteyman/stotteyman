window.addEventListener('load', function() {
    var beats = document.getElementsByClassName('beat');
    for (var i = 0; i < beats.length; i++) {
      var playPauseButton = beats[i].getElementsByClassName('play-pause')[0];
      var audioElement = new Audio(playPauseButton.getAttribute('data-audio'));
      playPauseButton.addEventListener('click', function() {
        if (audioElement.paused) {
          audioElement.play();
          beats[i].classList.add('popup');
        } else {
          audioElement.pause();
          beats[i].classList.remove('popup');
        }
      });
    }
  });
  