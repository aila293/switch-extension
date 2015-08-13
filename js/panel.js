function setTabIndex(){
    var i =1;
    $('button,section').each(function(index){
       this.tabIndex = i++; 
    });
}

function setFirstSectionFocus(){
    $('section').first().focus();
}

function setUpNavigation(){
    initiateAutoscan(function(){
        $('button,section').keydown(function(e){
            processKeydown(e);    
        });   
    }, processKeydown);
};

function processKeydown(e){
    e.stopPropagation();
    e.preventDefault();    
    var target = e.target;

    if (e.which == settings.select_code){

        if (settings.autoscan && !(autoscan_on)){ 
            startScan();
            return;
        } 

        if (target.tagName == 'BUTTON'){
            window.parent.postMessage(target.id, "*")
            $(target).prevAll().last().focus();
            stopScan();

        } else { //target is a section
            if (target.id=='interaction-controls'
            && !($('#next-section').is(':visible'))){
                window.parent.postMessage("map-sections", "*");
            } else {
                $(target).children().first().focus();
            }
            resetTime();
        }

    } else if (e.which == settings.scan_code){
        var next = $(target).next();
        if (next.length == 0){
            if (target.tagName == 'BUTTON'){
                $(target).parent().focus();
            } else {
                setFirstSectionFocus();
            }
        } else {
            next.focus();
        }
    }        
}

function blurHandler(){
    window.setTimeout(function(){
        if (document.activeElement == document.body 
            || $(':focus').length == 0) {
            window.parent.postMessage("lost focus", "*");
            //routes to content script for page access, 
            //then to background to respond to this frame
        } 
    }, 300); //wait for the new element to get the focus
}

document.addEventListener('DOMContentLoaded', function() {

    //so text of the bookmark button can be changed
    window.parent.postMessage("panel-loaded", "*"); 
    
    window.parent.postMessage(["panel-height", $(document).height()], "*");  //make panel-frame resize
    
    setTabIndex();
    setUpNavigation();
    setFirstSectionFocus();
    $('*').blur(blurHandler);
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { //from background
    switch(message){
        case "panel focus":
            setFirstSectionFocus(); 
            break;
        case "sectioning-on":
            $('#interaction-controls button').show();
            $('#unmap-sections').text("Clear sections");
            $('#next-section').focus();
            stopScan();
            break;
        case "sectioning-off":
            $('#interaction-controls button:not("#unmap-sections")').hide();
            $('#unmap-sections').text("Interact with the Page");
            $('#interaction-controls').focus();
            stopScan();
            break;   
        case "bookmarked":
            $("#add-bookmark").text("Remove Bookmark");
            break;
        case "not bookmarked":
            $("#add-bookmark").text("Bookmark this Page");
            break;            
    }

});