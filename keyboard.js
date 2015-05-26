var letters = ['e','t','a','o','i','n','s','h','r','d','l','u','c','m','f','w','y','p','v','b','g','k','j','q','x','z'];

var others = [' ', 'backspace', '\n', '.', '-', ',', '?', '+','='];

var capitals = ['E','T','A','O','I','N','S','H','R','D','L','U','C','M','F','W','Y','P','V','B','G','K','J','Q','X','Z'];

function loadKeys(){
    for (var i=0;i<letters.length;i++){
        $("#letters_sect").append("<span class='key letter' tabindex='"+(i+2)+"'>"+letters[i]+"</span>"); //tab starts at 2 (1 for section)
    }   
    
    $('#others_sect').attr('tabindex', [letters.length+2]);
    for (var i=0;i<others.length;i++){
        $("#others_sect").append("<span class='key other' tabindex='"+(i+letters.length+3)+"'>"+others[i]+"</span>");
    }   
    
    //create label for 'space' key
    //$('.other').first().attr('id', "space");
    labelKey(0, 'space');
    labelKey(2, 'newline');
    
    //set id for backspace key for styling (smaller font)
    $('.other')[1].id = "backspace";
}

function labelKey(index, name){ //for 'other' keys that need different content/appearance. index = place in 'other' array
    $('.other')[index].id = name;
    var host = document.getElementById(name);
    var root = host.createShadowRoot();
    root.textContent = name;
}

function resetFocus(){
    $('#letters_sect').focus();
}

function updateLetters(){
    var new_letters;
    if (caps_on){
        new_letters = capitals;
    } else {
        new_letters = letters;
    }
    for (var i=0;i<new_letters.length;i++){
        ($('.letter')[i]).innerText = new_letters[i];
    }
}

var caps_on = false;

document.addEventListener('DOMContentLoaded', function() {
    loadKeys(); 
    
    $('button').keydown(function(e){
        e.stopPropagation();
        if (e.which===13){ //enter
            var button_id = $(this).attr('id');
            if (button_id==='caps'){
                caps_on = true;
                updateLetters(); 
                $('.letter').first().focus(); //assume you want a letter after selecting 'caps'
            } else {
                window.parent.postMessage(button_id, "*")
                // id = 'close' keyboard, 'submit' text
                // scroll 'up', scroll 'down', 'next' link, 'open' keyboard
            }
        }
    });
    
    
    $('.section').keydown(function(e){
        var focus = $(':focus');
        if (e.which===9){ //tab
            e.preventDefault();
           var next_section = focus.next();
            if (next_section.length === 0){
                resetFocus();
            } else {
                next_section.focus();
            }
        } else if (e.which===13){ //enter
            focus.children(':first').focus();
        }
    });
    
    $('.key').keydown(function(e){
        e.stopPropagation();
        if (e.which===13){ //enter
            window.parent.postMessage($(':focus').text(), "*");  //to controls.js
            //type into own textbox
            var txt_field = $('#text');
            var val = txt_field.val(); 
            if ($(':focus').text()==='backspace'){
                val = val.substring(0,val.length-1);
            } else {
                val += $(':focus').text(); 
            }
            txt_field.val(val);
            
            resetFocus(); 
            if (caps_on){
                caps_on=false;
                updateLetters();
            }      
        }
    });

    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message === 'open'){
           // resetFocus(); //prevents typing with keyboard 
        }
    });

});
