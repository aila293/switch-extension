document.addEventListener('DOMContentLoaded', function() {

    $('button').keydown(function(e){
        e.stopPropagation();
        if (e.which===13){ //enter
            var button_id = $(this).attr('id');
            window.parent.postMessage(button_id, "*")
           
            if (button_id == 'select-section'){
                $('#next-section').focus();
            } else if (button_id !== 'next-link' 
                && button_id !== 'next-section'){
                 resetFocus();
            } 
        } else if (e.which === 9){
            if ($(this)[0] == $('body button').last()[0]){
                e.preventDefault();
                resetFocus();
            }
        }
    });
    
   resetFocus(); //start on first button

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
         console.log(message);
        if (message === 'refocus'){
            resetFocus(); 
        }  
    });
});

function resetFocus(){
    $('button').first().focus();
}

 