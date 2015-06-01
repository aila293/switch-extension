var text_selector = ":text, textarea, input[role='textbox'], input[type='url'], input[type='email'], input[type='password'], input[type='search'], [contenteditable='true']";

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
        "height: 200px;", 
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

var txt_field; //jQuery object, keep for backup in case the active class is lost?
var txt_index;
function openKeyboard(){
    if ($("#keyboard-frame")[0].style.display != 'none'){return;}
    
    $("#keyboard-frame").show();
    
    if (event.currentTarget == window){ //if opened from button
        if ($('.active-text-field').length == 0){
            var inputs = $(text_selector);
            txt_index = 0;
            while (!(isVisible(inputs[txt_index]))){
                txt_index++;
                if (txt_index==inputs.length){txt_index=0;}
            }
        } 
        //else stay at last active field
    } else { //if opened from focus on text field. Perhaps clicked on?
        txt_index = $(event.currentTarget).index(inputs);
        $('.active-text-field').removeClass('active-text-field');
    }
    
    var inputs = $(text_selector);
    $(inputs[txt_index]).addClass('active-text-field');
    txt_field = $('.active-text-field');
    chrome.runtime.sendMessage("open");
    dockKeyboard();
}

function nextInput(){
    var inputs = $(text_selector);
    txt_index++;
    if (txt_index == inputs.length){
        txt_index=0;
    }
    $('.active-text-field').removeClass('active-text-field');
    $(inputs[txt_index]).addClass('active-text-field');
    txt_field = $('.active-text-field');
    console.log(inputs[txt_index]);
    
    //test if on screen, if not scroll to place
    if (!(isVisible($('.active-text-field')[0]))){
        var pos = $('.active-text-field').offset().top;
        $(document).scrollTop(200);
        //this is the scrollbar that can't be accessed
    }
}

function dockKeyboard(){
    document.body.style.overflow = 'inherit';
    
    window.onresize = function (){
        document.documentElement.style.height = 
            (window.innerHeight - 210) + 'px';
        
        
//        var pos = $('#keyboard-frame').offset();
//
//        //works on Youtube, picks a part of the nav bar in KA
//        var cover = document.elementFromPoint(pos.left+10, pos.top+10);
////        cover.style.height = (window.innerHeight -210)+'px';
////        cover.style.overflowY = 'auto';
//        console.log(cover);
//        
//        var all = $('div');
//       // console.log(window.innerHeight-210);
//        for (var i=0;i<all.length;i++){
//            if ($(all[i]).height() + 210 > window.innerHeight
//            
//               && (all[i].className.indexOf("nav") > -1 
//                   || all[i].className.indexOf("menu") > -1 )
//               ){
//            console.log(all[i]);
//                all[i].style.height = (window.innerHeight - 210)+'px';
//                all[i].style.overflowY = 'auto';
//                break;
//            }
//        }
    };
    window.onresize(); 
}

//alternative docking using body wrapper
/*
function dockKeyboard(){ 
//dock using body wrapper. 
// Remove previous appendChild(keyboard). 
// Change scope of 'var keyboard'

    if ($('#my_body_wrapper').length !== 0){
        return;
    }
    var div = document.createElement('div');
    div.id='my_body_wrapper';
    div.style.overflow='scroll';
    $('body').wrapInner(div);
    
     window.onresize = function (){
     $('#my_body_wrapper').height(window.innerHeight - 240);
    };
    document.body.appendChild(keyboard);
}
*/

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
    var my_link_class = document.createElement('style');
    my_link_class.type = 'text/css';
    my_link_class.textContent = ".currently-selected-link {border: solid blue 3px !important;}";
    document.head.appendChild(my_link_class);  
    
    var my_text_class = document.createElement('style');
    my_text_class.type = 'text/css';
    my_text_class.textContent = ".active-text-field {border: solid orange 3px !important;}";
    document.head.appendChild(my_text_class);  
}

document.addEventListener("DOMContentLoaded", injectKeyboard(), false);
document.addEventListener("DOMContentLoaded", injectPanel(), false);

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
    } else { // letter or ascii character
        val += key;
    }
    txt_field.val(val);
}

function isVisible(element){ //DOM element
    var rect = element.getBoundingClientRect();
    var offset = 0;
       // console.log($('#keyboard-frame')[0].style.display);

    if ($('#keyboard-frame').is(':visible')){
        offset = $('#keyboard-frame').height();
    }
    return (rect.bottom > 0) //false if element above screen
            && (rect.top + offset <window.innerHeight) //false if below screen
            && (rect.right>0)
            && (rect.left<window.innerWidth)
            && (window.getComputedStyle(element)
                .getPropertyValue('visibility') !== 'hidden')
            && (window.getComputedStyle(element)
                .getPropertyValue('opacity') > 0)
            && ($(element).is(':visible'))
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
    
    var submit_rect = submits[0].getBoundingClientRect();
    var min_dist = getDistanceRects(txt_rect, submit_rect);
    var closest_submit = submits[0];
    
    for (var i=1; i<submits.length; i++){
        submit_rect = submits[i].getBoundingClientRect();
        var dist = getDistanceRects(txt_rect, submit_rect);
        if (dist < min_dist) {
            min_dist = dist;
            closest_submit = submits[i];
        }
    }
    //if none found, try last child of <form>?, id with 'submit' in it
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
            case 'next-input': nextInput();
                break;

                
            default:  // letter or key selection from keyboard
                txt_field.css('opacity', ['1']); //for the Google 'new tab' search box. Doesn't work anyway because this field can't be entered, it's supposed to just redirect to the browser navigation bar
                typeToInput(event.data);
        }
    }
}, false);


function mapDOM(){
    
}

/*
Can't see any text field that requires scrolling:
    -opening Keyboard sets body-scrollbar to top
    -scroll buttons don't work when keyboard open
    -get around by manually moving the body above the screen?

To do:
-access non-text input areas
-hierarchical navigation
    -find lowest-level div/nav/header/footer with >1 link

-email sites don't work
-docking overlaps on some sites (KhanAcademy / Youtube)
    -Chrome 'newtab': appends onto bottom b/c min-height > the maxheight I set
-more options for submit buttons
-links/inputs are not visible and don't know why (Kongregate, email)

-add browser navigation (open/close tab, type in url)

Small additions:
-buttons to change cursor position in text
-tab from last key to first key (keyboard)
-add "clear input" button to keyboard
-prioritize buttons instead of reset: 
    - e.g. 'next input' stays on 'next input'?

- doesn't allow Google/Youtube autocomplete


https://github.com/jjallen37/ChromeFormSwitch


Later:
- allow user to pick alternatives to tab/enter
- make keyboard as json object, use different keyboard layouts
- allow user to create page-specific buttons for common actions

https://object.io/site/2011/enter-git-flow/
mousetrap (create keyboard shortcuts) 

Fix scroll issue:
    -wrap body in own div, shorten, append iframe
        -doesn't appear in Google
        -makes Youtube footer stick to wrong place
        -makes every code piece in jQuery disappear
    -

*/

/* Debugging snippets

log scrollTop of all elements
    $(document).click(function(){
        var elements = $('*');
        for (var i=0;i<elements.length;i++){
            if (elements[i].scrollTop > 0) {
                console.log(elements[i]);
            }
        }
        //alert('done');
    });
               
log bounding client rect
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

*/