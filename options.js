// Saves options to chrome.storage.sync
var scan_key_code;
var select_key_code;

function saveOptions() {
    var auto = $('input[name="auto-scan"]:checked').val() == "on";
    var rate = $('input[name="scan-rate"]').val();
    var url_option = $('input[name="newtab-page"]:checked').val();
    var url;
    if (url_option == 'google.com'){
        url = "https://www.google.com";
    } else if (url_option == 'chrome'){
        url = "chrome://newtab";
    } else {
        url = ""; //figure out how to store/implement
    }
        
    chrome.storage.sync.set({
        autoscan: auto,
        scan_rate: rate,
        scan_code: scan_key_code,
        select_code: select_key_code,
        newtab_url: url
    }, function() {
        $('#status').text('Preferences saved.');
//        setTimeout(function() {
//          status.textContent = '';
//        }, 750);
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

// Restores state using the preferences in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get({
        //what default values to use
        autoscan: false,
        scan_rate: 3,
        scan_code: 9, //tab
        select_code: 13, //enter
        newtab_url: "https://www.google.com"
    }, function(items) {
        adaptAutoscan(items.autoscan);
        
        $('span.scan').text(keyCodeMap[items.scan_code] + "  ");
        $('span.select').text(keyCodeMap[items.select_code]+ "  ");

        $('input[name="scan-rate"]').val(items.scan_rate);
        switch (items.newtab_url){
            case "https://www.google.com":
                 $('input[name="newtab-page"]')[0].checked=true;
                break;
            case "chrome://newtab":
                $('input[name="newtab-page"]')[1].checked=true;
                break;
            default: 
                $('input[name="newtab-page"]')[2].checked=true;
                $('#custom-url').text(items.newtab_url);
        }
    });
}

function setupPage(){
    restoreOptions();    
    
    //make tab-accessible
    var i=1;
    $('section, input, button').each(function(){
        this.tabIndex = i++;
    });
    
    $('section').first().focus();
    
    $('section').keydown(function(e){
        if (e.which===9){
            e.preventDefault();
            e.stopPropagation();
    
            var i = $( "section:visible" ).index( this ) ;
            var next = $('section:visible')[++i];
            if (i== $('section:visible').length){i=0;} //rollover
            $($('section:visible')[i]).focus();
        }
    });
    
    $('input[value="on"]').click(function(){
        adaptAutoscan(true);
    });
    
    $('input[value="off"]').click(function(){
        adaptAutoscan(false);
    });

    
    $('#save').click(saveOptions);
}

document.addEventListener('DOMContentLoaded', setupPage);

var keyCodeMap = ["","","","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","SEMICOLON","EQUALS","COMMA","MINUS","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];
