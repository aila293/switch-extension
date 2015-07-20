function getActiveTab(callback){
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
        callback(tabs[0].id);
    });
}
function remove(tab){chrome.tabs.remove(tab);}

var zoom_levels = [0, 0.25, 0.33, 0.5, 0.67, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
function zoom(direction){
    chrome.tabs.getZoom(function(zoomFactor){
        var i = zoom_levels.indexOf(zoomFactor);
        for (var i=0;i<zoom_levels.length;i++){
            if (Math.abs(zoom_levels[i]-zoomFactor) < 0.01){
                break;
            }
        }
        if (direction == 'zoom-in'){++i;}
        else if (direction =='zoom-out'){--i;}
        else { i=0;} //reset to default
        if (i>=zoom_levels.length || i<0){return;}
        chrome.tabs.setZoom(zoom_levels[i]);
    });
}

function changeTab(){
    chrome.windows.getLastFocused({populate: true}, function(window){
        browser_tabs = window.tabs;
        var height = browser_tabs.length * 45 + 20;
        chrome.windows.create({'url': 'popup.html?changetab', 'width': 400, 'height': height, 'type': 'popup'}, function(window) {}); 
    });    
}

var main_window_tab_id;

function openPopup(purpose){
    getActiveTab(function(tabid){main_window_tab_id = tabid;});
    switch (purpose){
        case 'find':
            chrome.windows.create({'url': 'popup-keyboard.html?find', 'width': 700, 'height': 300, 'type': 'popup'}, function(window) {}); 
            break;
        case 'change-url':
            chrome.windows.create({'url': 'popup-keyboard.html?changeurl', 'width': 600, 'height': 400,'type': 'popup'}, function(window) {});
            break;
    }
}

function addBookmark(){
    chrome.tabs.query({active: true, lastFocusedWindow:true}, function(tabs){
        chrome.bookmarks.create({parentId: '1', title: tabs[0].title, url: tabs[0].url});
    });    
}

function openTab(url){
    switch(url){
        case 'new-tab':
            chrome.storage.sync.get({ 
                newtab_url: "https://www.google.com", 
            }, function(items) {
                chrome.tabs.create({url: items.newtab_url}); 
            });
            break;
        case 'settings':
            chrome.tabs.create({url: chrome.extension.getURL("options.html")});
            break;
        case 'bookmarks':
            chrome.tabs.create({url: chrome.extension.getURL("bookmarks.html")});
            break;
    }
}

var browser_tabs;
chrome.runtime.onMessage.addListener( //from the content script 
    function(message, sender, sendResponse) {
        switch(message){
                
            //relay to iframes
            case "keyboard focus":
            case "panel focus":
            case "sectioning-on":
            case "sectioning-off":
                chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, message);
                });
                break;
            
            //use chrome.tabs
            case 'reload': chrome.tabs.reload(); break;
            case 'new-tab': case 'settings': case 'bookmarks': openTab(message); break;
            case 'close-tab': getActiveTab(remove); break;
            case 'change-url': case 'find': openPopup(message); break;
            case 'change-tab': changeTab(); break;
            case 'zoom-in': case 'zoom-out': zoom(message); break;
            case 'add-bookmark': addBookmark(); break;
      }
  });

//info from the popup page, sent through controls.js
window.addEventListener("message", function(event){
    
    //purpose as event.data[0], information as event.data[1]
    switch(event.data[0]){
        case 'change-tab':
            var tabid = parseInt(event.data[1]);
            chrome.tabs.update(tabid, {active: true});
            break;
        case 'find':
            chrome.tabs.sendMessage(main_window_tab_id, event.data[1]);
            break;
        case 'change-url':
            chrome.tabs.update(main_window_tab_id, {url: event.data[1]}, function(tab){});
                
        //attempts to detect failure
            chrome.webRequest.onErrorOccurred.addListener(function(details){
//            console.log(details.error);
                var url = details.url.substring(0, details.url.length-1);
                if (url == intended_url){
                    url = url.replace("https://", "http://");
                    chrome.tabs.update(details.tabId, {url: url}, function(tab){});
                }
            }, {urls: ["https://*/*"]});
                
            chrome.webNavigation.onErrorOccurred.addListener(function(details){
                var url = details.url.substring(0, details.url.length-1);
    
                if (url == intended_url){
                    url = url.replace("https://", "http://");
                    console.log(url);
                    chrome.tabs.update(details.tabId, {url: url}, function(tab){});
                }
            });
                
            break;            
      }
});
