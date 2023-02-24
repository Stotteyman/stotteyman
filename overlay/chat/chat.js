// Show/hide chat overlay
var chatOverlay = document.getElementById("chat-overlay");
var hideChatBtn = document.getElementById("hide-chat");

hideChatBtn.addEventListener("click", function() {
  chatOverlay.classList.add("hide");
});

setTimeout(function() {
  chatOverlay.style.display = "flex";
}, 5000);
