document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.getSelected(undefined, function(tab) {
    chrome.tabs.sendMessage(tab.id, {}, function(response){
      console.log("response", response);
      var url = response.url;
      var html = [
      "<p>",
      response.height + "p",
      "</p><p>",
      response.url,
      "</p>"
      ];
      document.body.innerHTML = html.join("");
    });
  });
});