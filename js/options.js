//key codes for the scan and select key are stored in the ids of span.scan and span.select. The spans themselves show the name of the key (not the keycode)

function saveOptions(event) {
    event.preventDefault();
    
    var newtab_option = $('input[name="newtab-page"]:checked');
    var url = newtab_option.val();
    if (url == 'other'){
        url = $('#custom-url').val(); 
    } else if (url == "bookmarks"){
        url = chrome.extension.getURL("bookmarks.html");
    }
    var url_index = newtab_option.prevAll('input').length;  
        
    chrome.storage.sync.set({
        autoscan: $('[name="auto-scan"]:checked').val() == "on",
        scan_rate: parseFloat($('#scan_value').text()),
        scan_code: $('span.scan')[0].id,
        select_code: $('span.select')[0].id,
        newtab_url: url, 
        newtab_index: url_index
    }, function() {
        var status = $('#status');
        status.text('Preferences saved');
        setTimeout(function() {
          status.text('');
        }, 2000);

        stopScan();
    });
    
}

function adaptAutoscan(autoscan){
    if (autoscan){ //if autoscan is on
        $('input[value="on"]')[0].checked=true;
        $('.scan').hide();
         $('#scanrate').show();
    } else { //if autoscan is off
        $('input[value="off"]')[0].checked=true;
        $('#scanrate').hide();
       $('.scan').show();

    }
}

function restoreOptions() {
    chrome.storage.sync.get({ //with default values
        autoscan: false,
        scan_rate: 2,
        scan_code: 9, //tab
        select_code: 13, //enter
        newtab_url: "https://www.google.com", 
        newtab_index: 0
    }, function(items) {
        adaptAutoscan(items.autoscan);
        
        //fill in scan/select key info
        $('span.scan')[0].id = items.scan_code;
        $('span.select')[0].id = items.select_code;
        $('span.scan').text(keyCodeMap[items.scan_code] + "  ");
        $('span.select').text(keyCodeMap[items.select_code]+ "  ");
        $('span#scan_value').text(items.scan_rate);

        $('input[name="newtab-page"]')[items.newtab_index].checked=true;
        if ($("input[value='other']")[0].checked){
            $("#custom-url").val(items.newtab_url);
        }
    });
}

function processKeydown(e){
    e.preventDefault();
    e.stopPropagation();

    if (settings.autoscan && !(autoscan_on)){ 
        startScan();
    } else {
        
    var section = e.target.tagName == 'SECTION';
        
    if (e.which == settings.scan_code){
        if (section){
            var all_sections = $( "section:visible" );
            var i = all_sections.index( e.target ) ;
            var next = all_sections[++i];
            if (i== all_sections.length){i=0;} //rollover
            $(all_sections[i]).focus();                    
        } else {
            var index = $("input:visible, button:visible").index(e.target);
            var next = $("input:visible, button:visible")[index+1];

            //if "next" is not in the same section
            var this_section = $(e.target).closest('section')[0];
            if ($(next).closest('section')[0] == this_section){
                $(next).focus();
            } else {
               $(this_section).focus();
            }
        }

    } else if (e.which == settings.select_code){
        if (section){
            var inputs = $(e.target).find('input,button');
            if (inputs.length == 1){
                inputs[0].click();
                resetTime();
            } else { //applies to the "key inputs" section only
                $(e.target).find('input,button:visible').first().focus();
                resetTime();
            }
        } else {
            stopScan();
            e.target.click();
            if (e.target.value=='other'){
                chrome.windows.create({'url': 'popup-keyboard.html?newtaburl', 'width': 600, 'height': 400, 'type': 'popup'}, function(window) {}); 
            }
        }
    }
    }
}

function setupNavigation(){
    var i=1;
    $('section, input, button').each(function(){this.tabIndex = i++;});
    $('section').first().focus();
    
    initiateAutoscan(function(){
        $('section, input, button').keydown(function(e){
            processKeydown(e);
        });
    }, processKeydown);
}

function adjustScanRate(e, increment){
    e.preventDefault();
    var span = $('#scan_value');
    var val = parseFloat(span.text());
    val = (increment ? val+.5 : val-.5);
    if (val <= 0){val = 0.5;}
    span.text(val);    
}

function closePage(){
    chrome.tabs.query({active: true, lastFocusedWindow:true}, function(tabs){
        if (tabs[0].title == "Extensions"){ 
            //adapted from popup.js getOptionsPage
             var pages = chrome.extension.getViews();
            for (var i=0;i<pages.length;i++){
                if (pages[i] !== chrome.extension.getBackgroundPage()){ 
                    pages[i].close(); 
                }
            }
        } else {
            chrome.tabs.remove(tabs[0].id);   
        }
    });
}

function setupPage(){
    restoreOptions();
    setupNavigation();
    
    $('#save').click(saveOptions);
    $('#exit').click(function(e){e.preventDefault(); closePage();}); 
    
    $('#increase').click(function(e){adjustScanRate(e,true);});
    $('#decrease').click(function(e){adjustScanRate(e,false);});
    
    $('input[name="auto-scan"]').click(function(){adaptAutoscan(this.value=="on");});
    
    $('button.set').click(function(e){
        e.preventDefault(); 
        if ($(this).is('.scan')){var url = 'popup.html?scankey';}
        else {var url = 'popup.html?selectkey'}
        chrome.windows.create({'url': url, 'width': 250, 'height': 150, 'type': 'popup'}, function(window) {}); 
    });
    
}

document.addEventListener('DOMContentLoaded', setupPage);

window.addEventListener("message", function(event){
    switch(event.data[0]){
        case "scankey":
            $('span.scan')[0].id = event.data[1];
            $('span.scan').text(keyCodeMap[event.data[1]] + "  ");
            break;
        case "selectkey":
            $('span.select')[0].id = event.data[1];
            $('span.select').text(keyCodeMap[event.data[1]]+ "  ");
            break;
        case "newtab-url":
            $('#custom-url').val(event.data[1]);
            break;
    }
});

var keyCodeMap = ["","","","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","SEMICOLON","EQUALS","COMMA","MINUS","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
