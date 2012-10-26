if (window === top) {
  document.addEventListener("loadedmetadata", onMediaLoadedMetadata, true);
}

var media;

function onMessage(request, sender, sendResponse) {
    console.log("onMessage", request, sender);
    media.pause();
    sendResponse({
      url: media.src,
      height: media.videoHeight,
      position: media.currentTime
    });
}

// Media elements
function onMediaLoadedMetadata(event) {
  media = event.target;

  console.log("onMediaLoadedMetadata", event);
  
  //media.preload = "none";
  //media.autoplay = false;

  //listen for currentTime request
  chrome.extension.onMessage.removeListener(onMessage);
  chrome.extension.onMessage.addListener(onMessage);

  //tell background to setup context menu and page action
  chrome.extension.sendMessage(
    {
      url: media.src,
      height: media.videoHeight
    },
    function(response){
      if (!response.allowPropagation) {
        var overlay;
        // Site-specific hacks
        if(location.host.indexOf("apple.com") !== -1) {
          overlay = media.parentNode.getElementsByClassName("ACMediaControls")[0];
        } else if(location.host.indexOf("vimeo.com") !== -1) {
          overlay = media.parentNode.parentNode;
        } else if(/\byoutube5player\b/.test(media.parentNode.className)) {
          overlay = media.parentNode;
        }
        if(!overlay) overlay = media;
        // Prevent Default Context Menu
        overlay.addEventListener("contextmenu", function(e) {
          console.log("contentscript.js overlay contextmenu", overlay, e);
          e.stopPropagation();
        }, false);
      }
    }
  );
}

