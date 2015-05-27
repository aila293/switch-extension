var text_selector = ":text, textarea, input[role='textbox'], input[type='url'], input[type='email'], input[type='password'], input[type='search']";

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
    $(text_selector).focus(openKeyboard);
}

var txt_field; //jQuery object, used later for keyboard typing
function openKeyboard(){
    $("#keyboard-frame").show();
    if (event.currentTarget === window){
       // txt_field = $(text_selector).first();
        
        //allow user to pick which input?
        var inputs = $(text_selector);
        for (var i=0;i<inputs.length;i++){
            inputs[i].style.border = 'solid orange 2px';
            console.log(inputs[i]);
            if (isVisible(inputs[i])){
                txt_field = $(inputs[i]);
                break; //stop at first visible input?
            }
        }
        
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
        "border: solid black 3px;"
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
    my_class.textContent = ".currently-selected-link {border: solid blue 3px !important;}";
    document.head.appendChild(my_class);  
}

document.addEventListener("DOMContentLoaded", injectKeyboard(), false);
document.addEventListener("DOMContentLoaded", injectPanel(), false);

/*$(document).ready(function(){
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
*/
                 
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
    } else { //a letter or ascii character
        val += key;
    }
    txt_field.val(val);
}

function isVisible(element){ //DOM element, only tested on links for now
    var rect = element.getBoundingClientRect();
//    console.log(rect.top>0 || rect.bottom>0);
//    console.log(rect.top);
//    console.log(rect.bottom);
    
    return (rect.bottom>0)
        && (rect.top<window.innerHeight)
        && (rect.right>0)
        && (rect.left<window.innerWidth)
        && (window.getComputedStyle(element)
            .getPropertyValue('visibility') !== 'hidden')
        && (window.getComputedStyle(element)
            .getPropertyValue('opacity') > 0)
        //deal with element being overlapped by another
    ; 
}

var link_index;
function nextLink(){
     if (typeof link_index == 'undefined'){
        link_index = 0;
    } else {
        link_index++;
    }

    var links = $('a');
    while (!(isVisible(links[link_index])) ){
        link_index++; 
        if (link_index === links.length){link_index=0;} //roll-over
    }
    $(".currently-selected-link").removeClass("currently-selected-link");
    $(links[link_index]).addClass("currently-selected-link");
    console.log(links[link_index]);
   // console.log(links[link_index].offsetParent); //returns null for display:none?
}

//return DOM of closest 'submit' button to txt_field by midpoint
function findSubmit(){
    var txt_rect = txt_field.get(0).getBoundingClientRect();
    
    var submits = $(':submit');
    var min_distance = 900; //arbitrary big number
    var closest_submit;
    for (var i=0;i<submits.length;i++){
        var submit_rect = submits[i].getBoundingClientRect();
        var dist = getDistanceRects(txt_rect, submit_rect);
        if (dist < min_distance) {
            min_distance = dist;
            closest_submit = submits[i];
        }
    }
    //if none found, try last child of <form>? 
    return closest_submit;
}

function getDistanceRects(rect1, rect2){
    var rect1_mid = [(rect1.left+rect1.right)/2, 
                (rect1.top+rect1.bottom)/2];
    var rect2_mid = [(rect2.left+rect2.right)/2, 
                (rect2.top+rect2.bottom)/2];
    var a = rect1_mid[0]-rect2_mid[0];
    var b = rect1_mid[1]-rect2_mid[1];
    return Math.sqrt(a*a+b*b);
}

window.addEventListener("message", function(event){
    var my_origin = chrome.extension.getURL("");
    my_origin = my_origin.substring(0, my_origin.length-1); //remove slash at the end
    
    if (event.origin.indexOf(my_origin) != -1){ 
        switch(event.data){
                
            //from keyboard iframe
            case 'submit':
                var submit = findSubmit();
                console.log(submit);
                closeKeyboard();                
                submit.click();
                break;
            case 'close': closeKeyboard();
                break;
            case 'backspace': typeToInput('backspace');
                break;
                
            //from panel iframe
            case 'up': scrollWindow('up');
                break;
            case 'down': scrollWindow('down');
                break;
            case 'open': openKeyboard();
                break;
            case 'next-link': nextLink();
                break;
            case 'select-link':
                $('.currently-selected-link').get(0).click();
                break;
            
            default:  // letter or key selection from keyboard
                txt_field.css('opacity', ['1']); //for the Google 'new tab' search box. Doesn't work anyway because this field can't be entered, it's supposed to just redirect to the browser navigation bar
                typeToInput(event.data);
        }
    }
}, false);


/*
Recent updates: 
-docked iframe
-textarea in iframe
-backspace + newline keys
-scroll buttons (required move to separate iframe)
-next/select link buttons
-isVisible function in progress
-"submit text" button finds/clicks nearest submit button
-"open keyboard" button finds first visible input

Can't put scroll buttons in a docked iframe or all $('*').scrollTop() will return 0. Only the scrollbar for the whole window combined (host page and the docked iframe) can be accessed. (This scrollbar only appears if html.overflow is set to 'scroll', not 'auto'.)

To Do:
-select input when keyboard opened from ctrl panel
-add next/select input buttons
-add browser navigation (open/close tab, type in url)

-can I trigger an element's onclick from here?
        - .onclick()

-scroll to top / bottom buttons
-buttons to change cursor position in text

-auto-open doesn't always work (email sites)
-docking overlaps weirdly on some sites (KhanAcademy / Youtube sidebar)
    -Chrome 'newtab': appends onto bottom of page b/c min-height is larger than the maxheight I set
-closing keyboard moves scrollbar to top (b/c of focus?)


Details (possibly irrelevant to future versions):
-doesn't allow Google/Youtube autocomplete
-doesn't auto-open keyboard if focus begins in text box and stuff not loaded (e.g. Youtube)- check focus on pageload
-tab from last key to first key

Good later features:
- allow user to pick alternatives to tab/enter
- make keyboard as json object, use different keyboard layouts

https://object.io/site/2011/enter-git-flow/
mousetrap (create keyboard shortcuts) 


*/