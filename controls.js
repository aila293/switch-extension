var text_selector = ":text, textarea, input[role='textbox'], input[type='url'], input[type='email'], input[type='password'], input[type='search'], [contenteditable='true']";
var keyboard;
function injectKeyboard(){ 
    keyboard = document.createElement("iframe"); 
    keyboard.id = 'keyboard-frame';
    keyboard.src = chrome.extension.getURL("keyboard.html"); 

    //docking setup
    var html =  document.documentElement;
    html.style.overflow = 'auto';
    document.body.style.maxHeight = '100%';
    
    var style = [
        "display: none;",
        "width: 99%;",
        "height: 200px;", 
        "background-color: rgba(255,255,255, 0.9);"
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    keyboard.style.cssText = style_txt;    
    document.documentElement.appendChild(keyboard); 
    
    chrome.storage.sync.get({keyboard: false}, function(items){
        if (items.keyboard){
            $(text_selector).focus(openKeyboard);
        }
    });
}

var txt_field; //jQuery object, keep for backup in case the active class is lost?
var txt_index;
function openKeyboard(){
    
    if (event.currentTarget == window){ //if opened from button
        if ($('.active-text-field').length == 0){ //if no active field
            var inputs = $(text_selector);
            txt_index = 0;
            while (!(isVisible(inputs[txt_index]))){
                txt_index++;
                if (txt_index==inputs.length){txt_index=0;}
            }
        } //else stay at last active field
    } else { //if opened from focus on text field. clicked on or 'next input' button
        txt_index = $(text_selector).index(event.currentTarget);
        $('.active-text-field').removeClass('active-text-field');
    }
    
    txt_field =  $($(text_selector)[txt_index]);
    txt_field.addClass('active-text-field');
    console.log(txt_field[0]);
    
    if ($("#keyboard-frame")[0].style.display == 'none'){
        $("#keyboard-frame").show();
        chrome.runtime.sendMessage("open");
        dockKeyboard();
    }
    
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

var hidden_height = 210;
function dockKeyboard(){
    document.body.style.overflow = 'inherit';
    
    window.onresize = function (){
        document.body.style.height = 
            (window.innerHeight - hidden_height) + 'px';
        
     //attempts to fix docking/sidebar irregularities 
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
        "width: 80%;",
        "height: 70px;",
        "bottom: 1px;",
        "left: 5%;", 
        "border: solid black 3px;"
        //add style rules for iframe here
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    panel.style.cssText = style_txt;  
    
//    $(document).click(function(){
//        console.log("click");
//        console.log($('iframe')[0]);
//        $('iframe')[0].click();
//    });
//    
    $('iframe').each(function(){
       // console.log(this);
      //  var document = this.contentDocument;
//        console.log($(document).find('a')[0]);
    });
}

function injectMyStyles(){
    addStyle('.currently-selected-link', '{border: solid blue 3px !important;}');
    addStyle('.active-text-field', '{border: solid orange 3px !important;}');
    addStyle('.conceptual-section', '{border: solid purple 3px !important;}');
    addStyle('.active-section .conceptual-sub-section', '{border: solid mediumseagreen 3px;}'); 
    addStyle('.active-section', '{border: solid orchid 5px !important;}');
    addStyle('.current-sub-section', '{border: solid lightgreen 5px !important;}');
}

function addStyle(selector, style_rules){ //strings
    var rule = document.createElement('style');
    rule.type = 'text/css';
    rule.textContent = (selector + " " + style_rules);
    document.head.appendChild(rule);
}

document.addEventListener("DOMContentLoaded", injectKeyboard(), false);
document.addEventListener("DOMContentLoaded", injectPanel(), false);
document.addEventListener("DOMContentLoaded", injectMyStyles(), false);

function scrollWindow(direction){
    if (document.getElementById('keyboard-frame').style.display == 'none'){
        var scroll = $(document).scrollTop();
        switch(direction){
            case 'up': scroll -= window.innerHeight*0.8; break;
            case 'down': scroll += window.innerHeight*0.8; break;
            case 'top': scroll = 0; break;
            case 'bottom': scroll = document.body.scrollHeight; break;                
        }
        $(document).scrollTop(scroll);
    } else {
        //attempts to pretend to scroll by moving the body up
//        document.body.style.position = 'relative';
//        document.body.style.top = "-100px";
//        hidden_height -=100;
//        document.body.style.maxHeight = document.body.style.maxHeight+hidden_height;
//        //hidden_height -= 100;
//        window.onresize();
        
    }
}

function typeToInput(key){
    var val = txt_field.val(); 
    if (key === 'backspace'){
        val = val.substring(0,val.length-1);
    } else if (key === 'clear'){
        val = '';
    } else { //letter or character
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

//return DOM of closest 'submit' button to txt_field by midpoint
function findSubmit(){    
    var submits = $(':submit');
    
    var min_dist = getDistanceBetweenEls(txt_field[0], submits[0]);
    var closest_submit = submits[0];
    
    submits.each(function(){
        var dist = getDistanceBetweenEls(txt_field[0], this);
        if (dist < min_dist) {
            min_dist = dist;
            closest_submit = this;
        }
    });
//    for (var i=1; i<submits.length; i++){
//        submit_rect = submits[i].getBoundingClientRect();
//        var dist = getDistanceRects(txt_rect, submit_rect);
//        if (dist < min_dist) {
//            min_dist = dist;
//            closest_submit = submits[i];
//        }
//    }
    //if none found, try last child of <form>?, id with 'submit' in it
    return closest_submit;
}

function getDistanceBetweenEls(el1, el2){
    var rect1 = el1.getBoundingClientRect();
    var rect2 = el2.getBoundingClientRect();
    
    var rect1_mid = [(rect1.left+rect1.right)/2, 
                (rect1.top+rect1.bottom)/2];
    var rect2_mid = [(rect2.left+rect2.right)/2, 
                (rect2.top+rect2.bottom)/2];
    var a = rect1_mid[0]-rect2_mid[0];
    var b = rect1_mid[1]-rect2_mid[1];
    return Math.sqrt(a*a+b*b);
}

function nextSection(){
    mapDOM();
    
    //if the first 'next section' click
    if (typeof main_section_index == 'undefined'){ 
        main_section_index = 0;
        $($('.conceptual-section')[0]).addClass('active-section');
        mapSection($('.active-section'));

    //if in main section mode
    } else if ($('.current-sub-section').length == 0){ //main section mode
        main_section_index++;
        if (main_section_index == $('.conceptual-section').length){
            main_section_index = 0;
        }
        $(".active-section").removeClass("active-section");
        $($('.conceptual-section')[main_section_index]).addClass('active-section');
        mapSection($('.active-section'));

    //if in sub-section mode
    } else { 
        var list = $(".active-section").find('.conceptual-sub-section');
        var index = list.index( $('.current-sub-section')[0] );
        $('.current-sub-section').removeClass('current-sub-section');
        index++;
        if (index == list.length){index=0;}
        $(list[index]).addClass('current-sub-section');
    }
    
    //scroll to place
    if ($('.current-sub-section').length>0 && !(isVisible($('.current-sub-section')[0]))){
        $(document).scrollTop($('.current-sub-section').offset().top - 100);        
    } else if (!(isVisible($('.active-section')[0]))){
        $(document).scrollTop($('.active-section').offset().top - 100);
    }

}

function selectSection(){

    var current_sub_section = $('.current-sub-section'); 
    
     //if going from a main section to sub-section
    if (current_sub_section.length == 0){
         $(".active-section").find('.conceptual-sub-section').first().addClass('current-sub-section');
    }

    //if the current section being selected is/has one interactable
    else if (current_sub_section.is(interaction_selectors)){
        if (current_sub_section.is('link,button')){
            current_sub_section[0].click();
        } else if (current_sub_section.is(text_selector)){ 
            current_sub_section.focus();
        } else { //if non-text input
            current_sub_section[0].click();
        }
       // chrome.runtime.sendMessage("refocus");        
    }

    //if going from sub-section to a sub-sub-section
    else {
        mapSection(current_sub_section);
        //move "active section" to the currently section
        $('.active-section').removeClass('active-section');
        current_sub_section.removeClass('current-sub-section').addClass('active-section');
        //set new "current sub-section"
       current_sub_section.find('.conceptual-sub-section').first().addClass('current-sub-section');
    }               
                
}

function backSection(){
    //if active-section is a main section
    if ($('.active-section').is('.conceptual-section')){
        unmapSection($('.current-sub-section'));
        $('.current-sub-section').removeClass('current-sub-section');
        
    //if active-section is a sub-section
    }  else {
        unmapSection($('.active-section'));
        var one_up = $('.active-section').closest('.conceptual-sub-section:not(.active-section), .conceptual-section').addClass('active-section');
        one_up.find('.active-section').removeClass('active-section');
        $('.current-sub-section').removeClass('current-sub-section');
        $('.active-section').find('.conceptual-sub-section').first().addClass('current-sub-section');
        unmapSection($('.current-sub-section'));
    }
}

function unmapSection(section){
    section.find('.conceptual-sub-section').removeClass('conceptual-sub-section');
}

function sectionOff(selector){
    //includes items whose ids or classes match the tagname
    $(selector+', .'+selector+', #'+selector).has(interaction_selectors).each(function(){
        if ($(this).closest('.conceptual-section').length == 0 
            && isSmallEnough($(this))
           ){
            $(this).addClass('conceptual-section');  
            console.log(this);
        }
    });    
}

function isSmallEnough(element){
    var result = (element.width() > (window.innerWidth*.9) && element.height()>(window.innerWidth*.5))
    || element.is('body, html');
    if (!(result)){
        console.log(element[0]);
        console.log(element.width() > (window.innerWidth*.9));
        console.log(element.height()>(window.innerWidth*.5));
    }
    return !(result);
}

var interaction_selectors = "a:visible, input:visible, button:visible";
var first_interaction_selectors = "a:first-of-type:visible, input:first-of-type:visible, button:first-of-type:visible";

function mapDOM(){
    sectionOff('header');
    sectionOff('footer');
    sectionOff('aside');
    sectionOff('nav');
    sectionOff('section');
    sectionOff('ol, ul');
    sectionOff('table');
    sectionOff('article');
    sectionOff('main'); //sometimes takes up whole page
    sectionOff('p');
    
    //catch all the rest of the links
    $(first_interaction_selectors).each(function(){
        if ($(this).closest('.conceptual-section').length == 0){
            if (isSmallEnough($(this).parent())){
                $(this).parent().addClass('conceptual-section'); 
            } else {
                $(this).addClass('conceptual-section'); 
            }
        }
    });
    
    //remove any nested sections created by previous step
    $( ".conceptual-section" ).each(function(){
        if ($(this).parents('.conceptual-section').length != 0){
            $(this).removeClass('conceptual-section');
        }
    });
    
    //group 1-link sections that are siblings with other sections
     $( ".conceptual-section" ).each(function(){
        if ($(this).find(interaction_selectors).length == 1){
            var parent = $(this).parent(); 
            if (parent.children('.conceptual-section').length > 1){
                tryCombineSections(parent);
            }
        }
    });  
    
        //group 1-link sections that are part of a nested pattern of links (e.g. 2 siblings of "div a")
    $( ".conceptual-section" ).each(function(){
            var parent = $(this).parent(); 
            var type = this.tagName;
            if (parent.children(type+'.conceptual-section').length > 1){
                tryCombineSections(parent);
            }
    });  
    
    //two-generation pattern of links
     $( ".conceptual-section" ).each(function(){
            var parent = $(this).parent(); 
            var grandparent = parent.parent(); 
            var parent_type = parent[0].tagName.toLowerCase();
            if (grandparent.children(parent_type).children('.conceptual-section').length > 1){
                tryCombineSections(grandparent);
            }
    });    
    
    //group 1-link sections that are near other 1-link sections
    var single_sections = $(".conceptual-section").filter(function(){
        return $(this).find(interaction_selectors).length == 1;
    });
    for (var i=0;i<single_sections.length-1;i++){
        if (getDistanceBetweenEls(single_sections[i], single_sections[i+1]) < 400){
            var parent = $(single_sections[i]).parent();
            while (parent.find(single_sections[i+1]).length == 0){
                parent = parent.parent();
            }
            tryCombineSections(parent); //closest ancestor of both elements
        }
    }
        
    //group sections by location if $(".conceptual-section).length is too high
    
    
    //$('.conceptual-section').each(function(){   mapSections($(this));   });
}

function tryCombineSections(new_section){
     if (isSmallEnough(new_section)){ 
        new_section.addClass('conceptual-section');
        new_section.find('.conceptual-section').removeClass('conceptual-section');   
     }
}

function tabLinks(section){ //makes each link in the jquery object a sub-section
    section.find(interaction_selectors).addClass('conceptual-sub-section');
}

var main_section_index;
var sub_section_index;
function mapSection(section){  //takes 1 jquery object, can be section || subsection
    var interactables = section.find(interaction_selectors);
    var sub_sections = section.children().has(interaction_selectors); //set of children with links

    if (interactables.length < 6){ //or whatever number
        tabLinks(section);
    } else {

        while (sub_sections.length < interactables.length){ 
            if (sub_sections.length == 1){  //only one child: try next level
                sub_sections = sub_sections.children().has(interaction_selectors);
            } else {
                sub_sections.addClass('conceptual-sub-section');
                
                //add links that are outside sub-sections
                section.find(interaction_selectors).each(function(){
                    if ($(this).closest('.conceptual-sub-section').length == 0
                       || $(this).closest('.conceptual-sub-section')[0] == section[0]) //for when 'section' argument is a sub-section 
                    {
                        $(this).addClass('conceptual-sub-section');
                        }
                });
                
                 break;
            }
        }

        //if  # of sub_sections == # of links, there are no natural DOM divisions. 
        if (sub_sections.length == interactables.length){
            tabLinks(section);
        }
    }
    
    //reduce single-link sections into just that link
    sub_sections.each(function(){
        if ($(this).find(interaction_selectors).length == 1){
            $(this).removeClass('conceptual-sub-section');
            $(this).find(interaction_selectors).addClass('conceptual-sub-section');
        }
    });
    //artificially break long (many links) sections (e.g. W3schools)
}

chrome.runtime.onMessage.addListener( //from the background page
  function(message, sender, sendResponse) {
    window.find(message, false, false, true, false, false,true);
});

window.addEventListener("message", function(event){
    var my_origin = chrome.extension.getURL("");
    my_origin = my_origin.substring(0, my_origin.length-1); //remove slash at the end
    
    if (event.origin.indexOf(my_origin) != -1){ 
        switch(event.data){
                
            //from keyboard iframe
            case 'submit':  closeKeyboard(); findSubmit().click();   break;
            case 'close': closeKeyboard();  break;
            case 'next-input': nextInput(); break;
                
            //from control panel iframe
            case 'up': case 'down': case 'top': case 'bottom': case 'custom':
                scrollWindow(event.data);   break;
            case 'next-section': nextSection(); break;
            case 'select-section': selectSection(); break;
            case 'back-section': backSection(); break;
            case 'open': openKeyboard();    break;
            case 'lost focus':
                if (!($(':focus').is(text_selector))){
                    chrome.runtime.sendMessage("refocus"); 
                }
                break;
                
            case 'back': window.history.back(); break; //allow larger view of history
            case 'forward': window.history.forward(); break;
//            case 'snap-window': break;
//            case 'change-window': break;
//            case 'print': window.print(); break;
                
            //send to background page- requires chrome.tabs or chrome.windows
            case 'reload': case 'new-tab': case 'close-tab': case 'change-tab': case 'change-url': case 'find': case 'zoom-in': case 'zoom-out': case 'settings':
//            case 'copy-tab': case 'close-other-tabs': case 'pin-tab': case 'unpin-tab': case 'move-tab':
                chrome.runtime.sendMessage(event.data); 
                break;
            
            //character from keyboard
            default:  
                txt_field.css('opacity', ['1']); //for the Google 'new tab' search box. Doesn't work anyway since this field can't be entered, it's supposed to just redirect to the browser navigation bar
                typeToInput(event.data);
        }
    }
}, false);


/*  

Questions 
    -can I get to the omnibox / address bar?
    -is there a better way to detect if a page is https or http
    -how will it interact with the user's own virtual keyboard

To do:
    -fix terrible sectioning
    -settings: 
        -implement auto-scan w/ variable speed
        -implement variable key codes in keyboard.js and popup.js
    -clearer styling of sections
        -remove differences btwn main sections and sub-sections
    -access links/inputs in iframes?
        -can't access the iframes in the New Tab page because protocol is "chrome-search"
    -querying the active tab only works if one window open
        
To do later:
    -add bookmarking functions
    -custom scroll amount, zoom amount
    -other browser/window controls (larger history, window resizing/snapping/manipulation)
    -connect the "search" function with link selection
    -allow user to create page-specific buttons for common actions
    -store keyboards as json objects and allow different layouts
    -clean/refactor code

Ongoing issues:
-email sites don't work
-docking overlaps on some sites (KhanAcademy / Youtube)
    -Chrome 'newtab': appends onto bottom b/c min-height > the maxheight I set
-more possible selectors for submit buttons
-links/inputs not visible and don't know why (Kongregate, email)

https://github.com/jjallen37/ChromeFormSwitch
https://object.io/site/2011/enter-git-flow/
mousetrap (create keyboard shortcuts) 
-https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver


Fix scroll issue:
    -wrap body in own div, shorten, append iframe
        -doesn't appear in Google
        -makes Youtube footer stick to wrong place
        -makes every code piece in jQuery disappear

*/
