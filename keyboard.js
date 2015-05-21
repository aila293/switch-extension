var letters = ['e','t','a','o','i','n','s','h','r','d','l','u','c','m','f','w','y','p','v','b','g','k','j','q','x','z'];

var others = [' ', '.', '-', ',', '?', '+','='];

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
    $('.other').first().attr('id', "space");
    var space = document.getElementById('space');
    var space_root = space.createShadowRoot();
    space_root.textContent = 'space';
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
                //id = 'close', 'submit', 'top', or 'bottom'
            }

            if ($(this).hasClass('move')){
                $('#'+button_id).hide();
                resetFocus();
                if (button_id === 'top'){ $('#bottom').show(); } 
                else { $('#top').show(); }
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
            resetFocus(); 
            if (caps_on){
                caps_on=false;
                updateLetters();
            }      
        }
    });

    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message === 'open'){
            //resetFocus(); //prevents typing with keyboard 
        }
    });

});
