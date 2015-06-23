function setTabIndex(){
    var i =1;
    $('button,section').each(function(index){
       this.tabIndex = i++; 
    });
}

function setFirstSectionFocus(){$('section').first().focus();}
function setNextSectionFocus(section){$(section).next().focus();};
function setParentFocus(button){$(button).parent().focus();}
function setChildFocus(section){$(section).children().first().focus();}
function setFirstSiblingFocus(button){$(button).parent().children().first().focus();}
 
function setUpNavigation(){
    chrome.storage.sync.get({
        scan_code: 9, 
        select_code: 13
    }, function(items){

    $('button').keydown(function(e){
        e.stopPropagation();
        if (e.which == items.select_code){
            window.parent.postMessage(this.id, "*")
            setFirstSiblingFocus(this);
        } else if (e.which == items.scan_code){
            e.preventDefault();
            if ($(this).next().length == 0){
                setParentFocus(this);
            } else {
                $(this).next().focus();
            }
        }
    });
    
    $('section').keydown(function(e){
        e.stopPropagation();
        e.preventDefault();
        
        if (e.which == items.select_code){
            if (this.id=='interaction-controls'
               && !($('#next-section').is(':visible'))){
                window.parent.postMessage("map-sections", "*")
            } else {
                setChildFocus(this);    
            }
        } else if (e.which == items.scan_code){
            if ($(this).next().length == 0){
                setFirstSectionFocus();
            } else {
                setNextSectionFocus(this);
            }            
        }
    });
        
    });
}

document.addEventListener('DOMContentLoaded', function() {
//window.addEventListener('load', function() {

    setTabIndex();
    
    setUpNavigation();
    
    setFirstSectionFocus();
    
    $('#interaction-controls').children().first().hide();
    
    $('*').blur(function(){
        window.setTimeout(function(){
            if ($(':focus').length == 0){
                window.parent.postMessage("lost focus", "*");
                //routes to content script for page access, 
                //then to background to respond to this frame
            }
        }, 300); //wait for the new element to get the focus
    });
    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { //from background
        switch(message){
            case "refocus":
                setFirstSectionFocus(); 
                break;
            case "sectioning-on":
                $('#interaction-controls button').show();
                $('#map-sections').text("Re-section the page");
                $('#next-section').focus();
                break;
            case "sectioning-off":
                $('#interaction-controls button').hide();
                $('#map-sections').show();
                $('#map-sections').text("Section the page");
                $('#map-sections').focus();
                break;              
        }
       
    });
});
