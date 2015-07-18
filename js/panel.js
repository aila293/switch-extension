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
        } else {

        if (target.tagName == 'BUTTON'){
            window.parent.postMessage(target.id, "*")
            $(target).prevAll().last().focus();
            stopScan();

        } else { //section
            if (target.id=='interaction-controls'
            && !($('#next-section').is(':visible'))){
                window.parent.postMessage("map-sections", "*");

            } else {
                $(target).children().first().focus();
            }
            resetTime();
        }

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

//function onResize(){
//    window.parent.postMessage(["panel-height", $(document).height()], "*");
//}
//window.addEventListener("resize", onResize);


document.addEventListener('DOMContentLoaded', function() {
    //make panel-frame resize
    window.parent.postMessage(["panel-height", $(document).height()], "*");
    
    setTabIndex();
    setUpNavigation();
    $('#interaction-controls').children().first().hide();
    setFirstSectionFocus();
    
    
    //PREDICTKEY TESTING
    $("button#test").click(function(){
//        $.post("http://api.predictkey.com/predict",
//        {
//            "text": "It will use context of past text to predict the next word that is most ",
//            "apikey": "demo"
//        },
//        function(data, status){
//            alert(data.results[0].word);
//        },
//        "json"
//        );
            window.parent.postMessage("test", "*");
    });
    
    
    $('*').blur(blurHandler);

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) { //from background
        switch(message){
            case "panel focus":
                setFirstSectionFocus(); 
                break;
            case "sectioning-on":
                $('#interaction-controls button').show();
                $('#map-sections').text("Re-section the page");
                $('#next-section').focus();
                stopScan();
                break;
            case "sectioning-off":
                $('#interaction-controls button').hide();
                $('#map-sections').show();
                $('#map-sections').text("Interact with the Page");
                $('#interaction-controls').focus();
                break;              
        }
       
    });
});
