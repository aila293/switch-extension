function inject(){ 
    var frame = document.createElement("iframe"); 
    frame.id = 'keyboard-frame';
    frame.src = chrome.extension.getURL("keyboard.html");    
    
    //docking setup
    var html =  document.documentElement;
    html.style.overflow = 'auto';
    document.body.style.maxHeight = '100%';
    
    var style = [
        "display: none;",
        //"z-index: 100;", 
        "width: 99%;",
        "height: 185px;", 
        "background-color: rgba(255,255,255, 0.9);"
        //add style rules for iframe here
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    frame.style.cssText = style_txt;    
    document.documentElement.appendChild(frame); 
    
    //$('*').focus(function(){ alert($(this).prop("tagName"));});
    $(':text').focus(openKeyboard); //subset of inputs, doesn't include type='email' or type='url'
    //$('input').focus(openKeyboard);  
    $('textarea').focus(openKeyboard);
    $("input[role='textbox']").focus(openKeyboard);
    $("input[type='url']").focus(openKeyboard);
    $("input[type='email']").focus(openKeyboard);
    $("input[type='password']").focus(openKeyboard);
    $("input[type='search']").focus(openKeyboard);
}

var txt_field; //jQuery object
function openKeyboard(){
    $("#keyboard-frame").show();
    txt_field = $(event.currentTarget); 
    chrome.runtime.sendMessage("open");
    dockKeyboard();
}

function dockKeyboard(){
    document.body.style.overflow = 'inherit';
    
    window.onresize = function (){
     document.documentElement.style.height = 
         (window.innerHeight - 200) + 'px';
    };
    window.onresize(); 
}

function undockKeyboard(){
    document.body.style.overflow = '';
    window.onresize = function(){return;};
}

document.addEventListener("DOMContentLoaded", inject(), false);

window.addEventListener("message", function(event){
    var my_origin = chrome.extension.getURL("");
    my_origin = my_origin.substring(0, my_origin.length-1); //remove slash at the end
    
    if (event.origin.indexOf(my_origin) != -1){ 
        
        switch(event.data){
            case 'close':
                $("#keyboard-frame").hide();
                undockKeyboard();
                break;
            case 'submit':
               // $(":submit").css('border', ['solid blue 5px']);
                $(":submit").first().focus();
                //$(":focus").css('border', ['solid orange 5px']);
//automatically submits on Google search, have to press 'enter' on Youtube search (and jQuery site). Assumes only one on the page
                //alert($(':focus').attr('name'));
                
                $("#keyboard-frame").hide();
                break;
            case 'backspace':
                var val = txt_field.val(); 
                val = val.substring(0,val.length-1);
                txt_field.val(val);
                break;
            default: //key selections
                txt_field.css('opacity', ['1']); //to make text appear on the Google 'new tab' search box. Doesn't work anyway because this field can't be entered, it's supposed to just redirect to the browser navigation bar
                var val = txt_field.val(); 
                val += event.data; 
                txt_field.val(val);
        }
    }
}, false);


/*

Organization: thin bar at bottom with 5 buttons,
expands into full keyboard

to send in-frame input to page:    
window.parent.postMessage($('#text').val(), "*");
    
References:
-mousetrap (bind keyboard shortcuts) 

To Do:
-side controls: open keyboard, scroll up/down, click links, browser navigation (open/close tab, type in url)

-add buttons to change cursor position in text

-auto-open doesn't always work (email sites)
-auto-submit doesn't always work
-docking has unexpected effects on some sites
    -Khan Academy: inconsistent, docked sidebar disappears, shifts, or overlaps keyboard
    -Chrome 'newtab': appends onto bottom of page. min-height is larger than the maxheight I set


Details (possibly irrelevant to future versions):
-doesn't allow Google/Youtube autocomplete
-doesn't auto-open keyboard if focus begins in text box and stuff not loaded (e.g. Youtube)- check focus on pageload
-tab from last key to first key

Good later features:
- allow user to pick alternatives to tab/enter
- make keyboard as json object, use different keyboard layouts


https://object.io/site/2011/enter-git-flow/

*/