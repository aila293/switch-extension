function getActiveTab(callback){
    chrome.tabs.query({active: true}, function(tabs){
        callback(tabs[0].id);
    });
}

function duplicate(tab){chrome.tabs.duplicate(tab);}
function remove(tab){chrome.tabs.remove(tab);}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message){
                
            //relay to iframes
            case 'open':
            case 'refocus':
                chrome.tabs.query({active: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, message);
                });
                break;
            
            case 'reload': chrome.tabs.reload(); break;
            case 'new-tab': chrome.tabs.create({}); break;
                        //options: which window, url, if active
            case 'copy-tab': getActiveTab(duplicate); break;
            case 'close-tab': getActiveTab(remove); break;
            case 'close-other-tabs':
                chrome.windows.getLastFocused({populate: true}, function(window){
                    var all_tabs = window.tabs;
                    for (var i=0;i<all_tabs.length;i++){
                        all_tabs[i] = all_tabs[i].id;
                    }
                    chrome.tabs.query({active: true}, function(tabs){
                        var i = all_tabs.indexOf(tabs[0].id);
                        all_tabs.splice(i,1);
                        chrome.tabs.remove(all_tabs);
                    });
                });
                break;
            case 'change-url':
                //allow user to set url
                chrome.tabs.update({string: 'url'});
                break;
            case 'switch-tab':
                //allow user to choose tab
                chrome.tabs.update(tabid, {active: true});
                break;
            case 'pin-tab':
                chrome.tabs.update({pinned: true});
                break;
            case 'unpin-tab':
                //allow user to choose tab
                chrome.tabs.update(tabid, {pinned: false});
                //also, set this tab active?
                break;
            case 'move-tab':
                chrome.tabs.move();
                //takes tabids and moveProperties
                break;
            case 'zoom':
                break;
            case 'find':
                break;
      }
      
      
                      

//      
//    if (message==='open' || message ==='refocus'){
//        chrome.tabs.query({active: true}, function(tabs){
//            var tab_id = tabs[0].id;
//            chrome.tabs.sendMessage(tab_id, message);
//        });
//    }
  });