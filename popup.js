var background = chrome.extension.getBackgroundPage();

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


//purpose functions

function changeUrl(){
    document.title = "Enter new URL";

    var input = document.createElement('input');
    input.value = "https://www."; 
    input.size="50";
    $(input).insertBefore('#keyboard');            
    $('#punctuation3').insertBefore($("#punctuation2"));
    $('section').first().focus();
    $('#punctuation1').children()[2].innerText = '.com'; //change 'newline' key to '.com' key for urls
    
    //insert cancel button after submit
    var cancel = document.createElement('button');
    cancel.innerText = "Cancel";
    cancel.id = "cancel";
    $(cancel).insertAfter('#submit');

    window.addEventListener("message", function(event){
        if (event.data == 'submit'){
            if (purpose == "changeurl"){
                background.postMessage(["change-url", $('input').val()], "*");
            } else {
                getOptionsPage().postMessage(["newtab-url", $('input').val()], "*");
            }
            closeWindow();
        } else if (event.data == 'cancel'){
            closeWindow();
        } else {
            typeToInput(event.data);
        }
    });
}

function changeTab(){
    document.title = "Select Tab";
    populateTabs();
    $('#keyboard').remove();
    $('button').first().focus();


    initiateAutoscan(function(){
        $('button').keydown(function(e){
            changeTabHandler(e);
        });
        startScan();
    }, changeTabHandler);
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
        background.postMessage(["change-tab", e.target.id], "*");
        closeWindow();                     
    }  
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

    $('section').first().focus();

    window.addEventListener("message", function(event){
        if (event.data == "submit"){
            background.postMessage(["find", $('input').val()], "*");
        } else if (event.data == 'exit'){
            closeWindow();
        } else {
            typeToInput(event.data);
        }
    });    
}

function setKey(){
    document.body.textContent = "Enter switch input now";
    $('#keyboard').remove();

    $(document).keydown(function(e){
        getOptionsPage().postMessage([purpose, e.which], "*");
        closeWindow();
    });
}

function getOptionsPage(){
    //doesn't work from the chrome/extensions 'Options' link 
    var pages = chrome.extension.getViews({type: 'tab'});
    
//                for (var i=0;i<pages.length;i++){
//                    console.log(pages[i]);
//                    if (pages[i] != background){ 
//                        options_page = pages[i];
//                        break;
//                    }
//                }
    
    var options_page = pages[0];
    console.log(options_page);
    return options_page;
}

// main switch
var purpose;
document.addEventListener('DOMContentLoaded', function() {
    
    chrome.tabs.query({windowType: "popup"}, function(tabs){
        var url = tabs[0].url;
        var pos = url.indexOf("popup.html");
        purpose = url.substring(pos + 11);
    
        switch(purpose){
            case 'changeurl': case 'newtaburl': changeUrl(); break;
            case 'changetab': changeTab(); break;
            case 'find': find(); break;
            case 'scankey': case 'selectkey': setKey(); break;
        }
    });
    
});