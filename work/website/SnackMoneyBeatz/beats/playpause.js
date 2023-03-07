document.addEventListener('DOMContentLoaded', function() {
    var playPauseBtns = document.querySelectorAll('.play-pause');
    
    playPauseBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var audioEl = new Audio(btn.getAttribute('data-audio'));
        
        if (audioEl.paused) {
          audioEl.play();
          btn.src = 'pause.png';
        } else {
          audioEl.pause();
          btn.src = 'play.png';
        }
      });
    });
  });
  