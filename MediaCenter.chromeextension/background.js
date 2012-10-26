
// SETTINGS
var settings = {
  airplayName: "Apple TV",
  airplayHostname: "apple-tv.local",
  allowPropagation: true
};
var secureSettings = {
  airplayPassword: ""
};
var videoUrl;
var tabId;

function onMessage(request, sender, sendResponse) {
  console.log("onMessage", request, sender);
  if (request.url) {
    chrome.pageAction.show(sender.tab.id);
    chrome.pageAction.setTitle({
      tabId: sender.tab.id,
      title: request.height + "p"
    });
    if (videoUrl) {
      chrome.contextMenus.remove("airplay");
      chrome.contextMenus.remove("airplayStart");
    }
    chrome.contextMenus.create({
      id: "airplay",
      title: "Play on "+ settings.airplayName,
      contexts: ["all"]//["page", "video", "audio"]
    });
    chrome.contextMenus.create({
      id: "airplayStart",
      title: "Play on "+ settings.airplayName +" from start",
      contexts: ["all"]//["page", "video", "audio"]
    });
    videoUrl = request.url;
    tabId = sender.tab.id;
  }
  // Return nothing to let the connection be cleaned up.
  sendResponse({
    allowPropagation: settings.allowPropagation
  });
}

// Listen for the content script to send a message to the background page.
chrome.extension.onMessage.addListener(onMessage);
chrome.contextMenus.onClicked.addListener(onClickHandler);

function airplay(url, position) {
	var xhr = new XMLHttpRequest();
	var port = ":7000";
	if(/:\d+$/.test(settings.airplayHostname)) port = "";
	xhr.open("POST", "http://" + settings.airplayHostname + port + "/play", true, "AirPlay", secureSettings.airplayPassword);
  xhr.addEventListener("load", function(e) {
    // Set timer to prevent playback from aborting
		var timer = setInterval(function() {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "http://" + settings.airplayHostname + port + "/playback-info", true, "AirPlay", secureSettings.airplayPassword);
			xhr.addEventListener("load", function(e) {
        if(xhr.responseXML.getElementsByTagName("key").length === 0) { // playback terminated
					clearInterval(timer);
				}
			}, false);
			xhr.addEventListener("error", function(e) {
        clearInterval(timer);
      }, false);
			xhr.send(null);
		}, 1000);
	}, false);
  position = position || 0;
  console.log("airplay", url, position);
	xhr.send("Content-Location: " + url + "\nStart-Position: "+position.toFixed(2)+"\n");
}

function stop() {
	var xhr = new XMLHttpRequest();
	var port = ":7000";
	if(/:\d+$/.test(settings.airplayHostname)) port = "";
	xhr.open("POST", "http://" + settings.airplayHostname + port + "/stop", true, "AirPlay", secureSettings.airplayPassword);
	xhr.send(""); // sic
}

function onClickHandler(info, tab) {
  if (info.menuItemId.indexOf("airplay") === 0) {
    console.log("onClickHandler", info, tab);
    //get time from page
    chrome.tabs.sendMessage(tabId, {}, function(response){
      var url = response.url;
      var position = (info.menuItemId === "airplayStart") ? 0 : response.position;
      airplay(url, position);
    });
  }
}
