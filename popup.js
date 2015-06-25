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
            input.size="50";
            $(input).insertBefore('#keyboard');            
            $('#punctuation3').insertBefore($("#punctuation2"));
            $('section').first().focus();
            $('#punctuation1').children()[2].innerText = '.com'; //change 'newline' key to '.com' key for urls
            
            window.addEventListener("message", function(event){
                if (event.data == 'submit'){
                    background.postMessage(["change-url", $('input').val()], "*");
                    closeWindow();                   
                } else {
                    typeToInput(event.data);
                }
            });
            
            break;
                
        case 'changetab':
            document.title = "Select Tab";
            populateTabs();
            $('#keyboard').remove();
            
            $('button').first().focus();
            
            chrome.storage.sync.get({
                scan_code: 9,
                select_code: 13
            }, function(items){
                $('button').keydown(function(e){
                    e.preventDefault();
                    if (e.which == items.scan_code){
                        var next = $(this).next();
                        if (next.length==0){
                            next = $('button').first();
                        }
                        next.focus();
                    } else if (e.which == items.select_code){
                        background.postMessage(["change-tab", this.id], "*");
                        closeWindow();                     
                    }
                });
            });
            
            break;
        
        case 'find':
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
            break;
        
        case 'scankey': case 'selectkey':
            document.body.textContent = "Enter switch input now";
            $('#keyboard').remove();
            
            $(document).keydown(function(e){
                var pages = chrome.extension.getViews({type: 'tab'});
                
                //doesn't work from the chrome/extensions 'Options' link
                if (pages.length ==0){
                    pages = chrome.extension.getViews({type: 'popup'});
                }
                var options_page = pages[0]; 
      
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