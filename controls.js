function injectKeyboard(){ 
    var keyboard = document.createElement("iframe"); 
    keyboard.id = 'keyboard-frame';
    keyboard.src = chrome.extension.getURL("keyboard.html");    
    
    //docking setup
    var html =  document.documentElement;
    html.style.overflow = 'auto';
    document.body.style.maxHeight = '100%';
    
    var style = [
        "display: none;",
        //"z-index: 100;", 
        "width: 99%;",
        "height: 230px;", 
        "background-color: rgba(255,255,255, 0.9);"
        //add style rules for iframe here
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    keyboard.style.cssText = style_txt;    
    document.documentElement.appendChild(keyboard); 
    
    //$('*').focus(function(){ alert($(this).prop("tagName"));});
    $(':text').focus(openKeyboard); //subset of inputs, doesn't include type='email' or type='url'
    $('textarea').focus(openKeyboard);
    $("input[role='textbox']").focus(openKeyboard);
    $("input[type='url']").focus(openKeyboard);
    $("input[type='email']").focus(openKeyboard);
    $("input[type='password']").focus(openKeyboard);
    $("input[type='search']").focus(openKeyboard);
}

var txt_field; //jQuery object, used later for keyboard typing
function openKeyboard(){
    $("#keyboard-frame").show();
    if (event.currentTarget === window){
        //have user pick text field?
    } else {
        txt_field = $(event.currentTarget); 
    }
    chrome.runtime.sendMessage("open");
    dockKeyboard();
}

function dockKeyboard(){
    document.body.style.overflow = 'inherit';
    
    window.onresize = function (){
     document.documentElement.style.height = 
         (window.innerHeight - 240) + 'px';
    };
    window.onresize(); 
}

function closeKeyboard(){
    $("#keyboard-frame").hide();
    document.body.style.overflow = ''; //undocks this space
}

function injectPanel(){
    var panel = document.createElement('iframe');
    panel.id = 'panel-frame';
    panel.src = chrome.extension.getURL("panel.html");  
    document.body.appendChild(panel);
    
    var style = [
        "z-index: 100;", 
        "background-color: rgba(255,255,255, 0.9);",
        "position: fixed;",
        "width: 600px;",
        "height: 50px;",
        "bottom: 30px;",
        "left: 40%;", 
        "border: solid black 5px;"
        //add style rules for iframe here
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    panel.style.cssText = style_txt;   
    
    //add class to show which link is selected
    var my_class = document.createElement('style');
    my_class.type = 'text/css';
    my_class.textContent = ".currently-selected-link {border: solid blue 3px;}";
    document.head.appendChild(my_class);  
}

document.addEventListener("DOMContentLoaded", injectKeyboard(), false);
document.addEventListener("DOMContentLoaded", injectPanel(), false);

$(document).ready(function(){
    $(document).click(function(){
        var elements = $('*');
        for (var i=0;i<elements.length;i++){
            if (elements[i].scrollTop > 0) {
                console.log(elements[i]);
            }
        }
        //alert('done');
    });
}); //check scrollTop for all elements

/*
$(document).ready(function(){
    $('a').click(function(e){
        e.preventDefault();
        var dom_link = $(this).get(0);
        var rect = dom_link.getBoundingClientRect();
        console.log("left: "+rect.left);
        console.log("top: "+rect.top);
        console.log("right: "+rect.right);
        console.log("bottom: "+rect.bottom);
        console.log("visible: "+isVisible(dom_link));
    });
});
*/

function scrollWindow(direction){
    var scroll = $(document).scrollTop();
    if (direction === 'up'){
        scroll -= window.innerHeight*0.8;
    } else {
        scroll += window.innerHeight*0.8;
    }
    $(document).scrollTop(scroll);
}

function typeToInput(key){
    var val = txt_field.val(); 
    if (key === 'backspace'){
        val = val.substring(0,val.length-1);
    } else { //key is a letter or ascii character
        val += key;
    }
    txt_field.val(val);
}

function isVisible(element){ //DOM element, only tested on links for now
    var rect = element.getBoundingClientRect();
//    console.log(rect.top>0 || rect.bottom>0);
//    console.log(rect.top);
//    console.log(rect.bottom);
    
    return (rect.bottom>0) //element above window 
        && (rect.top<window.innerHeight); //element below window
    //should test left and right also?
}

var link_index;
function nextLink(){
     if (typeof link_index == 'undefined'){
        link_index = 0;
    } else {
        link_index++;
    }

    var links = $('a');
    console.log(links.length);
    while (!(isVisible(links[link_index])) ){
        link_index++; 
        if (link_index === links.length){link_index=0;} //roll-over
    }
    $(".currently-selected-link").removeClass("currently-selected-link");
    $(links[link_index]).addClass("currently-selected-link");
}

window.addEventListener("message", function(event){
    var my_origin = chrome.extension.getURL("");
    my_origin = my_origin.substring(0, my_origin.length-1); //remove slash at the end
    
    if (event.origin.indexOf(my_origin) != -1){ 
        switch(event.data){
                
            //from keyboard iframe
            case 'submit':
                $(":submit").first().focus(); //might not be right one
                //fall through to 'close'
            case 'close':
                closeKeyboard();
                break;
            case 'backspace':
                typeToInput('backspace');
                break;
                
            //from panel iframe
            case 'up':
                scrollWindow('up');
                break;
            case 'down':
                scrollWindow('down');
                break;
            case 'open':
                openKeyboard();
                break;
            case 'next-link': 
                nextLink();
                break;
            case 'select-link':
                $('.currently-selected-link').get(0).click();
                break;
            
            default:  // letter/key selection from keyboard
                txt_field.css('opacity', ['1']); //for the Google 'new tab' search box. Doesn't work anyway because this field can't be entered, it's supposed to just redirect to the browser navigation bar
                typeToInput(event.data);
        }
    }
}, false);


/*
Can't put scroll buttons in a docked iframe or all $('*').scrollTop() will return 0. Only the scrollbar for the whole window combined (host page and the docked iframe) can be accessed. (This scrollbar only appears if html.overflow is set to 'scroll', not 'auto'.)

References:
-mousetrap (bind keyboard shortcuts) 

To Do:
-add input selection buttons
-add browser navigation (open/close tab, type in url)
-select input when keyboard opened from ctrl panel

-scroll to top / bottom buttons
-buttons to change cursor position in text

-auto-open doesn't always work (email sites)
-auto-submit doesn't always work
-docking has unexpected effects on some sites
    -Khan Academy: inconsistent, docked sidebar disappears, shifts, or overlaps keyboard
    -Chrome 'newtab': appends onto bottom of page. min-height is larger than the maxheight I set
    -Youtube: sidebar appears over iframe
-closing keyboard moves scrollbar to top (b/c of focus?)


Details (possibly irrelevant to future versions):
-doesn't allow Google/Youtube autocomplete
-doesn't auto-open keyboard if focus begins in text box and stuff not loaded (e.g. Youtube)- check focus on pageload
-tab from last key to first key

Good later features:
- allow user to pick alternatives to tab/enter
- make keyboard as json object, use different keyboard layouts

https://object.io/site/2011/enter-git-flow/

*/