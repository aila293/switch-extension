document.addEventListener('DOMContentLoaded', function() {
    
    $('button').keydown(function(e){
        e.stopPropagation();
        if (e.which===13){ //enter
            var button_id = $(this).attr('id');
             window.parent.postMessage(button_id, "*")
            //scroll 'up', scroll 'down', 'next' link, 'open' keyboard
             resetFocus();
        }
    });
});

function resetFocus(){
    $('button').first().focus();
}
