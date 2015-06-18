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

document.addEventListener('DOMContentLoaded', function() {
    
    chrome.tabs.query({windowType: "popup"}, function(tabs){
        var url = tabs[0].url;
        var pos = url.indexOf("popup.html");
        var purpose = url.substring(pos + 11); //this to end
    
    switch(purpose){
        case 'changeurl':
            document.title = "Enter new URL";
            var input = document.createElement('input');
            input.value = "https://www.";
            document.body.appendChild(input);
            var submit = document.createElement('button');
            submit.type = 'submit';
            submit.textContent = 'Enter';
            document.body.appendChild(submit);

            $(input).focus();

            $(submit).click(function(){
                background.postMessage(["change-url", $('input').val()], "*");
                closeWindow();
            });
            break;
                
        case 'changetab':
            document.title = "Select Tab";
            populateTabs();
            $('button').first().focus();

            $('button').click(function(){
                background.postMessage(["change-tab", this.id], "*");
                closeWindow();
            });
            break;
        
        case 'find':
            document.title = "Enter text";
            var input = document.createElement('input');
            document.body.appendChild(input);
            var submit = document.createElement('button');
            submit.type = 'submit';
            submit.textContent = 'Search';
            document.body.appendChild(submit);
            var exit = document.createElement('button');
            exit.textContent = 'Exit Search';
            document.body.appendChild(exit);

            $('input').focus();

            $(submit).click(function(){
                background.postMessage(["find", $('input').val()], "*");
            });

            $(exit).click(closeWindow);
            break;
        
        case 'scankey': case 'selectkey':
            document.body.textContent = "Enter scan input now";
            $(document).keydown(function(e){
                var pages = chrome.extension.getViews({type: 'tab'});
                
                if (pages.length ==0){
                    pages = chrome.extension.getViews({type: 'popup'});
                }
                var options_page = pages[0];
        //doesn't work in the chrome options link
      
//                for (var i=0;i<pages.length;i++){
//                    console.log(pages[i]);
//                    if (pages[i] != background){ 
//                        options_page = pages[i];
//                        break;
//                    }
//                }
                
                console.log(options_page);
                options_page.postMessage([purpose, e.which], "*");
                //replace messaging with using chrome.storage and handling onChanged in options.js?
                closeWindow();
            });
    }
        
    });
});