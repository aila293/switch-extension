chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message==='open'){
        chrome.tabs.query({active: true}, function(tabs){
            var tab_id = tabs[0].id;
            chrome.tabs.sendMessage(tab_id, "open");
        });
    }
  });