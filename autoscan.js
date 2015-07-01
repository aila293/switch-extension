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
*/
            

function initiateAutoscan(callback, handler){
     chrome.storage.sync.get({
        autoscan: false,
        scan_rate: 3,
        scan_code: 9, 
        select_code: 13
    }, function(items){
        settings = items; 
        keyHandler = handler;
        if (!(settings.autoscan)){
            showFocusStyle(); 
        }
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
        toggleFocusStyle();
        interval_id = setInterval(function(){
            triggerScan(); 
        }, settings.scan_rate * 1000);          
    }
}

function stopScan(){
    if (settings.autoscan){
        clearInterval(interval_id); 
        autoscan_on = false;
        toggleFocusStyle();
    }
}

function resetTime(){
    if (settings.autoscan){
        clearInterval(interval_id);
        startScan();
    }
}

function toggleFocusStyle(){
    if (autoscan_on){
        showFocusStyle();
    } else {
        $(document.querySelector("#focus-style")).remove();
        $('#focus-style').remove();
    }

}

function showFocusStyle(){
    var style = ":focus {border: solid red 3px !important;}"; 
    var element = document.createElement('style');
    element.type = 'text/css';
    element.textContent = style;
    element.id = "focus-style";
    document.head.appendChild(element);
}