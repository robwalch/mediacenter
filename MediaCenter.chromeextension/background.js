
// SETTINGS
var settings = {
      airplayHostname: "apple-tv.local",
      allowPropagation: true
    },
    secureSettings = {
      airplayPassword: ""
    };

function onRequest(request, sender, sendResponse) {
  console.log("onRequest", request, sender, settings.menuitem);
  if (request.url) {
    chrome.pageAction.show(sender.tab.id);
    if (settings.menuitem) {
      chrome.contextMenus.remove("airplay");
    }
    settings.menuitem = chrome.contextMenus.create({
      "id": "airplay",
      "title": "Send via AirPlay",
      "contexts":["page","video", "audio"]
    });
    settings.url = request.url;
  }
  // Return nothing to let the connection be cleaned up.
  sendResponse(settings);
}

// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);
chrome.contextMenus.onClicked.addListener(onClickHandler);

function airplay(url) {
  console.log("airplay", url);
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
	xhr.send("Content-Location: " + url + "\nStart-Position: 0\n");
}

function stop() {
	var xhr = new XMLHttpRequest();
	var port = ":7000";
	if(/:\d+$/.test(settings.airplayHostname)) port = "";
	xhr.open("POST", "http://" + settings.airplayHostname + port + "/stop", true, "AirPlay", secureSettings.airplayPassword);
	xhr.send(""); // sic
}

// TODO: airplayImage ??

function onClickHandler(info, tab) {
  if (info.menuItemId == "airplay") {
    console.log("onClickHandler", info, tab);
    airplay(settings.url);
  }
}
