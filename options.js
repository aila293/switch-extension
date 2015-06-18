//key codes for the scan and select key are stored in the ids of span.scan and span.select. The spans themselves show the name of the key (not the keycode)

function saveOptions(event) {
    event.preventDefault();
    
    var newtab_option = $('input[name="newtab-page"]:checked');
    var url = newtab_option.val();
    if (url == 'other'){
        url = $('input[name="custom-url"]').val(); 
    }
    var url_index = newtab_option.prevAll('input').length;  
        
    chrome.storage.sync.set({
        autoscan: $('[name="auto-scan"]:checked').val() == "on",
        scan_rate: $('[name="scan-rate"]').val(),
        scan_code: $('span.scan')[0].id,
        select_code: $('span.select')[0].id,
        keyboard: $('[name="keyboard"]:checked').val() == "on",
        newtab_url: url, 
        newtab_index: url_index
    }, function() {
        $('#status').text('Preferences saved');
        setTimeout(function() {
          $('#status').text('');
        }, 2000);
    });
    //navigate this window to the newtab page
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
        scan_rate: 3,
        scan_code: 9, //tab
        select_code: 13, //enter
        keyboard: false, 
        newtab_url: "https://www.google.com", 
        newtab_index: 0
    }, function(items) {
        adaptAutoscan(items.autoscan);
        
        //fill in scan/select key info
        
        $('span.scan')[0].id = items.scan_code;
        $('span.select')[0].id = items.select_code;
        $('span.scan').text(keyCodeMap[items.scan_code] + "  ");
        $('span.select').text(keyCodeMap[items.select_code]+ "  ");

        var keyboard_val = items.keyboard ? "on" : "off";
        $('[name="keyboard"][value="'+keyboard_val+'"]')[0].checked=true;
        $('input[name="scan-rate"]').val(items.scan_rate);
        $('input[name="newtab-page"]')[items.newtab_index].checked=true;
    });
}

function setupNavigation(){
    var i=1;
    $('section, input, button').each(function(){this.tabIndex = i++;});
    
    $('section').first().focus();
    
    chrome.storage.sync.get({
        scan_code: 9, 
        select_code: 13
    }, function(items){
    
    $('section').keydown(function(e){
        e.preventDefault();
        if (e.which == items.scan_code){
            e.stopPropagation();
    
            //:visible to exclude hidden scan-related optiosn
            var i = $( "section:visible" ).index( this ) ;
            var next = $('section:visible')[++i];
            if (i== $('section:visible').length){i=0;} //rollover
            $($('section:visible')[i]).focus();
        } else if (e.which == items.select_code){
            var inputs = $(this).find('input,button');
            if (inputs.length == 1){
                if (inputs[0].type == "number"){
                    $(inputs[0]).focus();
                } else {
                    inputs[0].click();
                }
            } else { //applies to the "key inputs" section only
                $(this).find('input,button:visible').first().focus();
            }
        }
    });
        
    $('input,button').keydown(function(e){
        e.preventDefault();
        e.stopPropagation();
        if (e.which == items.scan_code){
            
            var next = $("input, button")[ $("input, button").index(this) + 1];
            
            //if "next" is not in the same section
            if ($(next).closest('section')[0] == $(this).closest('section')[0]){
                $(next).focus();
            } else {
                $(this).closest('section').focus();
            }
            
        } else if (e.which == items.select_code){
            this.click();
        }
    });
        
    });
}

function setupPage(){
    restoreOptions();
    setupNavigation();
    
    $('#save').click(saveOptions);
    $('#return').click(function(){
        chrome.tabs.query({active: true}, function(tabs){
            chrome.tabs.remove(tabs[0].id);
        }); 
    });
    
    $('input[name="auto-scan"]').click(function(){adaptAutoscan(this.value=="on");});
    
    $('button.set').click(function(e){
        e.preventDefault(); //otherwise page will reset
        if ($(this).is('.scan')){var url = 'popup.html?scankey';}
        else {var url = 'popup.html?selectkey'}
        chrome.windows.create({'url': url, 'width': 250, 'height': 150, 'type': 'popup'}, function(window) {}); 
    });
}

document.addEventListener('DOMContentLoaded', setupPage);

window.addEventListener("message", function(event){
    if (event.data[0] == "scankey"){
        $('span.scan')[0].id = event.data[1];
        $('span.scan').text(keyCodeMap[event.data[1]] + "  ");
    } else { //select key
        $('span.select')[0].id = event.data[1];
        $('span.select').text(keyCodeMap[event.data[1]]+ "  ");
    }
});

var keyCodeMap = ["","","","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","SEMICOLON","EQUALS","COMMA","MINUS","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
