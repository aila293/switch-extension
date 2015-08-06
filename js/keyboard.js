var letters = ['e','t','a','o','i','n','s','h','r','d','l','u','c','m','f','w','y','p','v','b','g','k','j','q','x','z'];

var punctuation = ['space','backspace','new line',',','.',
                   '\'','\"','-','?','!',
                   '/','@','#','_',':',';'];

var capitals = ['E','T','A','O','I','N','S','H','R','D','L','U','C','M','F','W','Y','P','V','B','G','K','J','Q','X','Z'];

var symbols = ['1','2','3','4','5',
               '6','7','8','9','0',
               '$','&','*','(',')',
               '%','^','+','=', '\\',
               '[',']','{','}','|','~'];

function loadKeys(arr, name){
    var size = 5; //section size
    var section_index =1;
    var div = document.getElementById(name+"_div");
    
    function incrementSection(){
        var sect = document.createElement("section");
        sect.id = name + section_index;
        section_index++;
        div.appendChild(sect);
        return sect;
    }
    var current_section = incrementSection();
    
    for (var i=0;i<arr.length;i++){
        if ((i>0 && arr.length-i>=size) && i%size==0){
            current_section = incrementSection();       
        }
        current_section.innerHTML += "<span>"+(arr[i] || "") +"</span>";
    }   
    current_section.className = "last";
}

function resetFocus(){ $('div:visible').first().focus(); }

function updateLetters(){
    var new_letters;
    if (caps_on){new_letters = capitals;}
    else { new_letters = letters; }
    
    $('#letters_div').find('span').each(function(index, el){
        this.innerText = new_letters[index];
    });
}

function toggleSymbols(){
    var symbols = $('#symbols_div');
    if (symbols.is(':visible')){
        symbols.hide();
        $('#'+id).text("Show Numbers/Symbols");
        adjustFrameHeight($(document).height()-150);
        setTimeout(adjustFrameHeight, 50);
    } else {
        symbols.show();
        $('#'+id).text("Hide Numbers/Symbols");
        adjustFrameHeight();
    }
}

function processButton(id){
    switch(id){
        case 'caps':
            caps_on = !(caps_on);
            updateLetters(); 
            $('#letters_div').focus();                  
            break;
        case 'symbols':
            toggleSymbols();
            symbols.focus();
            break;
        case 'submit':
            $('#submit').focus();
            window.parent.postMessage(id, "*");   
            break;
        case 'close':
            $("#words_div").hide();
            window.parent.postMessage(id, "*");   
            break;
        default:
            resetFocus();
            window.parent.postMessage(id, "*");   
    }
}

function processKeydown(e){
    e.stopPropagation();
    e.preventDefault();
    var target = e.target;

    if (e.which == settings.scan_code){
        var next = $(target).next();
        if (!(next.is(':visible'))){next = next.next();}

        if (next.length==0){
            if (target.tagName == 'DIV'){
                next = $('div:visible').first();
            } else {
                next = $(target).parent();
            }
        }
        next.focus();

    } else if (e.which == settings.select_code){
        if (settings.autoscan && !(autoscan_on)){ 
            startScan(); 
        } else {

        switch(target.tagName){

            case 'DIV': case 'SECTION':
                $(target).children()[0].focus();
                resetTime();
                break;
            case 'BUTTON': 
                processButton(target.id); 
                stopScan();
                break;
            case 'SPAN':   
                
                var div = $(target).closest('div')[0];
                var text = target.innerText;
                
                if (div.id == 'letters_div' || text == "backspace"){
                    window.parent.postMessage(text, "*"); 
                    window.parent.postMessage("get-word", "*");
                    
                    var words_div = $("#words_div");
                    if (!(words_div.is(":visible"))){
                        words_div.show();
                        adjustFrameHeight();
                    }
                    resetFocus();
                    
                } else if(div.id == "words_div") {
                    text = text.substring(current_word.length) + " ";
                    window.parent.postMessage(text, "*"); 
                    clearWords();
                } else {
                    window.parent.postMessage(text, "*"); 
                    resetFocus();
                }
                
                if (caps_on){
                    caps_on=false;
                    updateLetters();
                } 
                resetTime();
                break;
        }
            
        }
    }
}

function adjustFrameHeight(height){
    if (!height) height = $(document).height();
    try { //if in the popup keyboard
        chrome.windows.getLastFocused(function(window){
            chrome.windows.update(window.id, {height: height+60});
        });
    } catch(e){ //if from the iframe
        window.parent.postMessage(["keyboard-height", height], "*");      
    }
}

var current_word;
var limit = 15;

function completeWord(str){
    current_word = str;
    var count = 0;
    
    for (var i=0;i<wordlist.length && count<limit;i++){
        if (wordlist[i].substring(0,str.length) == str.toLowerCase()){
            $("#words_div span")[count].innerText = wordlist[i];
            count++;
        }
    }

    for (;count<limit;count++){
        $("#words_div span")[count].innerText = ""; 
    }
}

function clearWords(){
    $("#words_div span").each(function(){this.innerText = ""});
    $("#letters_div").focus();
}

function addWordSpaces(){
    var words = document.getElementById("words_div");
    for (var i=0;i<limit;i++){
        var span = document.createElement("span");
        words.appendChild(span);
    }
}

var caps_on = false;
document.addEventListener('DOMContentLoaded', function() {
    loadKeys(letters, "letters");
    loadKeys(punctuation, "punctuation");
    loadKeys(symbols, "symbols");
    loadKeys(new Array(limit), "words");
    
    $('div,section,span,button').each(function(index,element){
        this.tabIndex = index;
    });
    
    initiateAutoscan(function(){
        $('div, section, button, span').keydown(function(e){
            processKeydown(e);    
        });
    }, processKeydown);
    
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message == 'keyboard focus'){
        adjustFrameHeight();
        resetFocus(); 
    } else {
        completeWord(message);
    }
});
