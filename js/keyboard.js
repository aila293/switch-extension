//var letters = ['e','t','a','o','i','n','s','h','r','d','l','u','c','m','f','w','y','p','v','b','g','k','j','q','x','z'];
//most commonly used letters

var letters = ["s", "a", "c", "m", "p", "r", "t", "b", "f", "g", "d", "l", "h", "i", "e", "n", "o", "w", "u", "v", "j", "k", "q", "y", "z", "x"];
//most commonly used first letters in words

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

function updateCapitals(){
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
        $("#toggle-symbols").text("Show Numbers/Symbols");
    } else {
        symbols.show();
        $("#toggle-symbols").text("Hide Numbers/Symbols");
    }
    adjustFrameHeight();
}

function processButton(id){
    switch(id){
        case 'caps':
            caps_on = !(caps_on);
            updateCapitals(); 
            $('#letters_div').focus();                  
            break;
        case 'toggle-symbols':
            toggleSymbols();
            $("#symbols_div").focus();
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
            return;
        } 

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
                } else if (div.id == "words_div") {
                    text = text.substring(current_word.length) + " ";
                    window.parent.postMessage(text, "*"); 
                    clearWords();
                } else {
                    window.parent.postMessage(text, "*"); 
                    resetFocus();
                }
                
                if (caps_on){
                    caps_on=false;
                    updateCapitals();
                } 
                stopScan();
                break;
        }
    }
}

function adjustFrameHeight(){
    try { //if in the popup keyboard
        chrome.windows.getLastFocused(function(window){
            chrome.windows.update(window.id, {height: height+60});
        });
    } catch(e){ //if from the iframe
//        window.parent.postMessage(["keyboard-height", 100], "*");    
//        setTimeout(function(){ //wait for height to change
            window.parent.postMessage(["keyboard-height", $(document).height()], "*");
//        }, 10)
    }
}

var current_word;
var limit = 15; //for number of predicted words to show

function completeWord(str){
    current_word = str;
    var words_div = $("#words_div");
    words_div.children().remove();

    var word_predictions = [];
    for (var i=0;i<wordlist.length && word_predictions.length < limit;i++){
        if (wordlist[i].substring(0,str.length) == str.toLowerCase()){
            word_predictions.push(wordlist[i]);
        }
    }
    loadKeys(word_predictions, "words");
    words_div.find('*').each(function(){
        this.tabIndex = 1; //make focusable
    });
    
    if (word_predictions.length == 0){
        clearWords();
    } else {
        if (!(words_div.is(":visible"))){
            words_div.show();
        }
        adjustFrameHeight();
    }
    resetFocus();
}

function clearWords(){
    $("#words_div").hide();
    $("#letters_div").focus();
}

var caps_on = false;
document.addEventListener('DOMContentLoaded', function() {
    loadKeys(letters, "letters");
    loadKeys(punctuation, "punctuation");
    loadKeys(symbols, "symbols");    
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
