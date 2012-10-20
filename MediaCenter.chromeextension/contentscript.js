// Media elements
function handleLoadEvent(event) {
  var media = event.target;

  console.log("handleLoadEvent", event);
  
  //media.preload = "none";
  //media.autoplay = false;

  // Resolve URL
  var anchor = document.createElement("a");
  anchor.href = media.src;

  //media.addEventListener("loadstart", handleLoadEvent, true);
  //media.addEventListener("loadeddata", handleLoadEvent, true);
  media.addEventListener("loadeddata", handleLoadEvent, true);


  //tell background to setup context menu and page action
  chrome.extension.sendRequest({url: anchor.href}, function(response){
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
  });
}

document.addEventListener("loadstart", handleLoadEvent, true);