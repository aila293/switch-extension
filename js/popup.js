var background = chrome.extension.getBackgroundPage();

// general functions
function populateTabs(){
    var browser_tabs = background.browser_tabs;
    for (var i=0;i<browser_tabs.length;i++){
   
        var option = document.createElement('button');
        option.className = 'tab';
        option.id = browser_tabs[i].id;
        if (browser_tabs[i].active){option.className += ' active';}

        var title = " "+browser_tabs[i].title.substring(0,20);
        if (title != browser_tabs[i].title){title = title+"...";}

        option.innerHTML = "<img src='"+browser_tabs[i].favIconUrl+"'><span>"+title+"</span>";
        document.body.appendChild(option);
    }  
}

function closeWindow(){
    chrome.windows.getLastFocused(function(window){
        chrome.windows.remove(window.id);
   }); 
}

function typeToInput(key){
    var val = $('input').val();
    switch(key){
        case 'backspace':
            val = val.substring(0,val.length-1);
            break;
        case 'clear':
            val = '';
            break;
        case 'space':
            val += " ";
            break;
        case 'new line':
            val += "\n";
            break;
        default:
            val += key;
    }
    $('input').val(val);
}

function changeTabHandler(e){
    e.preventDefault();
    if (e.which == settings.scan_code){
        var next = $(e.target).next();
        if (next.length==0){
            next = $('button').first();
        }
        next.focus();
    } else if (e.which == settings.select_code){
        if (settings.autoscan && !(autoscan_on)){ 
            startScan(); 
        } else {
            background.postMessage(["change-tab", e.target.id], "*");
            closeWindow();  
        }
    }  
}

//purpose-specific functions

function changeUrl(){
    document.title = "Enter new URL";

    var input = document.createElement('input');
    input.value = "http://www."; 
    input.size="50";
    $(input).insertBefore('#keyboard');            

    $('#punctuation3').insertBefore($("#punctuation2"));
    $('section').first().focus();
    $('#punctuation1').children()[2].innerText = '.com'; //change 'newline' key to '.com' key for urls
    
    //insert cancel button after submit
    var cancel = document.createElement('button');
    cancel.innerText = "Cancel";
    cancel.id = "exit";
    $(cancel).insertAfter('#submit');
}

function changeTab(){
    document.title = "Select Tab";
    populateTabs();

    $('button').first().focus();

    initiateAutoscan(function(){
        $('button').keydown(function(e){
            changeTabHandler(e);
        });
    }, changeTabHandler);
}

function find(){
    document.title = "Enter text";
    
    var input = document.createElement('input');
    $(input).insertBefore('#keyboard');

    //replace 'capitals' with exit button
    $('#caps').remove();
    var exit = document.createElement('button');
    exit.textContent='Exit Search';
    exit.id = 'exit';
    $(exit).insertBefore('#symbols');
    
    $('#submit').text("Search");

    $('section').first().focus();  
}

function setKey(){
    document.body.textContent = "Enter switch input now";
    
    $(document).keydown(function(e){
        getOptionsPage().postMessage([purpose, e.which], "*");
        closeWindow(); 
    });
}

function getOptionsPage(){    
    var pages = chrome.extension.getViews();
        for (var i=0;i<pages.length;i++){
            if (pages[i] !== background){ 
                var options_page = pages[i]; //does this always work?
                break;
            }
        }
    return options_page;
}

function setBookmark(){
    // choose folder, option to type name of new folder
    // type name of bookmark
}

// main switch
var purpose;
document.addEventListener('DOMContentLoaded', function() {
    
    chrome.tabs.query({windowType: "popup"}, function(tabs){
        var url = tabs[0].url;
        var pos = url.indexOf("?");
        purpose = url.substring(pos + 1);
    
        switch(purpose){
            case 'changeurl': case 'newtaburl': changeUrl(); break;
            case 'find': find(); break;

            case 'changetab': changeTab(); break;
            case 'scankey': case 'selectkey': setKey(); break;
            case 'bookmark': setBookmark();
        }
    });
    
});

//only used in typing-related popups
window.addEventListener("message", function(event){
    switch(event.data){
        case "submit":
            
            switch(purpose){
                case "newtaburl":
                    getOptionsPage().postMessage(["newtab-url", $('input').val()], "*");
                    closeWindow();
                    break;
                case "changeurl":
                     background.postMessage([purpose, $('input').val()], "*");
                    closeWindow();
                    break;
                case "find":
                    background.postMessage([purpose, $('input').val()], "*");
                    $('#submit').focus(); 
                    break;
            }
             
            break;
        case "exit":
            closeWindow();
            break;
        case "get-word":
            //do nothing, no word completion
            break;
        default:
            typeToInput(event.data);                
    }
});  