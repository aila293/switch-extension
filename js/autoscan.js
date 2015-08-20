var settings;
var interval_id;
var autoscan_on = false;
var keyHandler;

/* include in the select_code key handler:

    if (settings.autoscan && !(autoscan_on)){ 
        startScan(); 
    } else {
at the top 

stopScan() at bottom-level selection
resetTime() at upper-level selection

Autoscan system: 
 - hit switch once to start
 - selecting section resets interval
 - selecting a button ends scan
 - hit switch again to start

*/
            

function initiateAutoscan(callback, handler){
     chrome.storage.sync.get({
        autoscan: false,
        scan_rate: 2,
        scan_code: 9, 
        select_code: 13
    }, function(items){
        settings = items; 
        keyHandler = handler;
         
        var style_txt;
        if (!(settings.autoscan)){
            style_txt = ":focus {border: solid red 3px !important;}"; 
        } else {
            style_txt = ":focus {border: solid lightblue 1px !important;}";
        }
        var element = document.createElement('style');
        element.type = 'text/css';
        element.textContent = style_txt;
        element.id = "focus-style";
        document.head.appendChild(element);
        
        callback();
    });
}

function keydownEvent(which, target){
    var e = jQuery.Event("keydown");
    e.which = which;
    e.target = target;
    return e;
}

function triggerScan(){
    var e = keydownEvent(settings.scan_code, document.activeElement);
    keyHandler(e);
}

function startScan(){
    if (settings.autoscan){
        autoscan_on = true;
        showFocusStyle(true);
        interval_id = setInterval(function(){
            triggerScan(); 
        }, settings.scan_rate * 1000);          
    }
}

function stopScan(){
    if (settings.autoscan){
        clearInterval(interval_id); 
        autoscan_on = false;
        showFocusStyle(autoscan_on);
    }
}

function resetTime(){
    if (settings.autoscan){
        clearInterval(interval_id);
        startScan();
    }
}

function showFocusStyle(scanning){
    if (scanning){
        document.querySelector("#focus-style").innerText = ":focus {border: solid red 3px !important;}";
    } else {
        document.querySelector("#focus-style").innerText =  ":focus {border: solid lightblue 1px !important;} input[type='radio']:focus{border: solid lightblue 3px !important;}";
    }
}

