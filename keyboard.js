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

function loadKeys(arr, section, tab_offset){
    var size = 5; //section size
    for (var i=0;i<arr.length;i++){
        if ((i>0 && arr.length-i>=size) && i%size==0){section = section.next();}
        section.append("<span tabindex='"+(i+tab_offset)+"'>"+arr[i]+"</span>");
    }   
}

function resetFocus(){ $('div').first().focus(); }

function updateLetters(){
    var new_letters;
    if (caps_on){new_letters = capitals;}
    else { new_letters = letters; }
    
    $('#letters_div').find('span').each(function(index, el){
        this.innerText = new_letters[index];
    });
}

function processButton(id){
    switch(id){
        case 'caps':
            caps_on = !(caps_on);
            updateLetters(); 
            $('#letters_div').focus();                  
            break;
        case 'symbols':
            if ($('#symbols_div').is(':visible')){
                $('#symbols_div').hide();
                this.innerText = "Show Numbers/Symbols";
            } else {
                $('#symbols_div').show();
                this.innerText = "Hide Numbers/Symbols";
            }
            $('#symbols_div').focus();
            break;
        default:
            resetFocus();
            window.parent.postMessage(id, "*");   
    }
}

var caps_on = false;

document.addEventListener('DOMContentLoaded', function() {
    loadKeys(letters, $('#letters1'), 2);
    loadKeys(punctuation, $('#punctuation1'), $('#punctuation1')[0].tabIndex + 1);
    loadKeys(symbols, $('#symbols1'), $('#symbols1')[0].tabIndex + 1)
    $('#punctuation1').children()[1].id = "backspace"; //id for font-setting
    
    chrome.storage.sync.get({
        scan_code: 9, 
        select_code: 13
    }, function(items){
       
    $('div,section,button,span').keydown(function(e){
        e.stopPropagation();
        e.preventDefault();
       
        if (e.which == items.scan_code){
            var next = $(this).next();

            if (!(next.is(':visible'))){next = next.next();}

            if (next.length==0){
                if ($(this).is('div')){
                    next = $('div').first();
                } else {
                    next = $(this).parent();
                }
            }
            
            next.focus();
        
        } else if (e.which == items.select_code){

            switch(this.tagName){
                case 'DIV': case 'SECTION':
                    $(this).children()[0].focus();
                    break;
                case 'BUTTON': processButton(this.id); break;
                case 'SPAN':   
                    window.parent.postMessage(this.innerText, "*");  
                    
                    if ($(this).closest('div')[0].id=='letters_div'){
                        $('#letters_div').children()[0].focus();
                    } else {
                        resetFocus(); 
                    }
                    
                    if (caps_on){
                        caps_on=false;
                        updateLetters();
                    } 
                    break;
            }
        }
    });
        
    });
    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     console.log(message);
        if (message === 'open'){
            resetFocus(); 
        }  
    });
});
