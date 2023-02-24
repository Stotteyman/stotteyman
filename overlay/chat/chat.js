// Apply CSS to chat iframe
var chatIframe = document.getElementById("chat-iframe");
chatIframe.onload = function() {
  var iframeHead = chatIframe.contentDocument.head;
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(`
    .h-full {
      background-color: transparent !important;
    }
    .bg-secondary-dark {
      background-color: transparent !important;
    }
    .border-secondary-lighter {
      border-color: transparent !important;
    }
    .dark .dark\\:bg-secondary {
      background-color: transparent !important;
    }
    body {
      --tw-text-opacity: 1;
      color: white !important;
    }
    .text-lg {
      visibility: hidden !important;
    }
    .chat-input {
      visibility: hidden !important;
    }
    .bg-secondary-lightest {
      visibility: hidden !important;
    }
    .bg-secondary {
      visibility: hidden !important;
    }
    .bg-secondary-lighter {
      visibility: hidden !important;
    }
    .border-secondary-lighter {
      border-color: transparent !important;
    }
    .bg-secondary-light {
      visibility: hidden !important;
    }
    .border-secondary-light {
      border-color: transparent !important;
    }
    .pt-3 {
      padding-top: 0rem;
    }
    .line-clamp-
