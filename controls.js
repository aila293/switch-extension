//TYPING-RELATED

var text_selector = ":text, textarea, input[role='textbox'], input[type='url'], input[type='email'], input[type='password'], input[type='search'], [contenteditable='true']";
var keyboard;
function injectKeyboard(){ 
    keyboard = document.createElement("iframe"); 
    keyboard.id = 'keyboard-frame';
    keyboard.src = chrome.extension.getURL("keyboard.html"); 
 
    var style = [
        "display: none;",
        "width: 99%;",
        "height: auto;",  //includes hidden section
        "z-index: 100;", 
        "position: fixed;",
        "bottom: 1px;",
        "background-color: rgba(255,255,255, 0.9);",
        "border: solid black 3px;",
        "margin: auto;"
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

    if (event.currentTarget == window){ //opened from button
        if ($('.active-text-field').length == 0){ //no active field
            var inputs = $(text_selector);
            txt_index = 0;
            while (!(isVisible(inputs[txt_index]))){
                txt_index++;
                if (txt_index==inputs.length){txt_index=0;}
            }
        } //else stay at last active field
    } else { //if opened from focus on text field
        txt_index = $(text_selector).index(event.currentTarget);
        $('.active-text-field').removeClass('active-text-field');
    }
    
    txt_field =  $($(text_selector)[txt_index]);
    txt_field.addClass('active-text-field');
    console.log(txt_field[0]);
    
    if ($("#keyboard-frame")[0].style.display == 'none'){
        $("#keyboard-frame").show();
       var height = $("#keyboard-frame").height();
        $("#keyboard-space-padding").height(height);
        
        chrome.runtime.sendMessage("open");
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
        var pos = $('.active-text-field').offset().top - 100;
        $(document).scrollTop(pos);
    }
}

function closeKeyboard(){
    $("#keyboard-frame").hide();
    $("#keyboard-space-padding").height($('#panel-frame').height());
    chrome.runtime.sendMessage("refocus");        
}

function typeToInput(key){
    var val = txt_field.val();
    switch(key){
        case 'backspace':
            val = val.substring(0,val.length-1);
            break;
        case 'clear':
            val = '';
            break;
        case 'space':
            val += " ";
            break;
        case 'new line':
            val += "\n";
            break;
        default:
            val += key;
    }
    txt_field.val(val);
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
    //if none found, try last child of <form>?, id with 'submit' in it
    return closest_submit;
}

function injectPanel(){
    
    var panel = document.createElement('iframe');
    panel.id = 'panel-frame';
    panel.src = chrome.extension.getURL("panel.html");  
    document.body.appendChild(panel);
    
    var style = [
        "z-index: 100;", 
        "background-color: rgba(255,255,255, 0.4);",
        "position: fixed;",
        "width: 99%;",
        "height: 70px;",
       // "height: auto;", //about twice too big
        "bottom: 0px;",
        "border: solid black 3px;"
    ];
    
    var style_txt = "";
    for (var i=0;i<style.length;i++){
        style_txt += style[i];
    }    
    panel.style.cssText = style_txt;  
    
    var padding = document.createElement("div"); 
    padding.id="keyboard-space-padding";
    $(padding).height(panel.style.height);
    $('body').append(padding);
}

function injectMyStyles(){
    addStyle('.active-text-field', '{border: solid orange 3px !important;}');
    addStyle('.visible-section', '{border: solid purple 3px !important;}');
    addStyle('.active-section .conceptual-sub-section', '{border: solid mediumseagreen 3px;}'); 
    addStyle('.conceptual-sub-section .conceptual-sub-section', '{border: none !important;}');
    //addStyle('.conceptual-sub-section .conceptual-sub-section .conceptual-sub-section', '{border: "" ;}'); 
    
    addStyle('.active-section', '{border: solid orchid 5px !important;}');
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
    var scroll = $(document).scrollTop();
    switch(direction){
        case 'up': scroll -= window.innerHeight*0.8; break;
        case 'down': scroll += window.innerHeight*0.8; break;
        case 'top': scroll = 0; break;
        case 'bottom': scroll = document.body.scrollHeight; break;                
    }
    $(document).scrollTop(scroll);
}

function isVisible(element){ //DOM element
    var rect = element.getBoundingClientRect();
    var offset = 0;

    if ($('#keyboard-frame').is(':visible')){
        offset = $('#keyboard-frame').height();
    }
    return (rect.bottom > 0) //false if element above screen
            && (rect.top + offset <window.innerHeight - $('#keyboard-space-padding').height()) //false if below screen
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

var active_section_index;
function moveSection(forward){  //boolean for next section or prev section   
    
    var next_section;
    if (typeof active_section_index == 'undefined'){  //if first mapping of the page
        active_section_index = 0;
        next_section =  $('.visible-section').first();
        next_section.addClass('active-section');
        mapSection(next_section);
    } else {
        if (forward){ //if going forward 
            active_section_index++;
            if (active_section_index == $('.visible-section').length){
                active_section_index = 0;
            }
        } else { //if going backward
            active_section_index--;
            if (active_section_index < 0){
                active_section_index = $('.visible-section').length-1;
            }
        }     
        var current_section = $(".active-section");
        current_section.removeClass("active-section");
        unmapSection(current_section);
        
        next_section = $($('.visible-section')[active_section_index]);
        next_section.addClass('active-section');
        mapSection(next_section);
    }
    
    if (!(isVisible(next_section[0]))){
        $(document).scrollTop(next_section.offset().top - 100);
    }   
    
}

function selectSection(){
    var current_section = $('.active-section');
  
    if (current_section.is(interaction_selectors)){
        if (current_section.is('link,button')){
            current_section[0].click();
        } else if (current_section.is(text_selector)){ 
            current_section.focus();
        } else { //if non-text input
            current_section[0].click();
        }
    } else {
        current_section.removeClass('active-section');
        $('.visible-section').removeClass('visible-section');
        
        var sub_sections = current_section.find('.conceptual-sub-section');
        sub_sections.removeClass('conceptual-sub-section').addClass('conceptual-section visible-section');
        var new_section = sub_sections.first();
        new_section.addClass('active-section');
        mapSection(new_section);
    }                            
    active_section_index=0;
}

function backSection(){    
    var current_section = $('.active-section').removeClass('active-section');
    unmapSection(current_section);
    
    var new_section = current_section.parent().closest('.conceptual-section').addClass('active-section');
    new_section.find('.conceptual-section').removeClass('conceptual-section').removeClass('visible-section').addClass('conceptual-sub-section');
  
    var new_siblings = new_section.parent().closest('.conceptual-section,body').find('.conceptual-section').addClass('visible-section');
    active_section_index = $(".visible-section").index(new_section);   
}

function mapSection(section){  //marks sub-sections
    var interactables = section.find(interaction_selectors);
    var sub_sections = section.children().has(interaction_selectors); //set of children with links

    if (interactables.length < 6){ 
        tabLinks(section);
    } else {

        while (sub_sections.length < interactables.length){ 
            if (sub_sections.length == 1){  //only one child: try next level
                sub_sections = sub_sections.children().has(interaction_selectors);
            } else {
                sub_sections.addClass('conceptual-sub-section');
                
                //add links outside sub-sections
                section.find(interaction_selectors).each(function(){
                    if ($(this).closest('.conceptual-sub-section').length == 0){
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
        var inner_links = $(this).find(interaction_selectors);
        if (inner_links.length == 1){
            $(this).removeClass('conceptual-sub-section');
            inner_links.addClass('conceptual-sub-section');
        }
    });
    //artificially break long (many links) sections (e.g. W3schools)
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
//            console.log(this);
        }
    });    
}

function isSmallEnough(element){
    var result = (element.width() > (window.innerWidth*.9) && element.height()>(window.innerWidth*.5))
    || element.is('body, html');
    if (!(result)){
        //console.log(element[0]);
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
    
    if ($('.visible-section').length==0){
        $('.conceptual-section').addClass('visible-section');  
        moveSection(true);
        chrome.runtime.sendMessage("sectioning-on");
    }
    
}

function unmapDOM(){ //remove classes or just remove the styling?
    $('.conceptual-section').removeClass('conceptual-section');
    $('.conceptual-sub-section').removeClass('conceptual-sub-section');
    $('.active-section').removeClass('active-section');
    $('.visible-section').removeClass('visible-section');
    chrome.runtime.sendMessage("sectioning-off");
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
            case 'up': case 'down': case 'top': case 'bottom': scrollWindow(event.data); break;
            case 'map-sections': mapDOM(); break;
            case 'next-section': moveSection(true); break;
            case 'select-section': selectSection(); break;
            case 'prev-section': moveSection(false); break;
            case 'back-section': backSection(); break;
            case 'unmap-sections': unmapDOM(); break;
            case 'open': openKeyboard(); break;
            case 'lost focus':
                if (!($(':focus').is(text_selector) 
                     || (typeof $(':focus')[0] == 'undefined') //hopefully this means the focus is in an iframe? Might not be mine though
                     )){
                    //console.log($(':focus')[0]);
                    chrome.runtime.sendMessage("refocus"); 
                }
                break;
            case 'back': window.history.back(); break;
            case 'forward': window.history.forward(); break;
                
            //send to background- requires chrome.tabs/chrome.windows
            case 'reload': case 'new-tab': case 'close-tab': case 'change-tab': case 'change-url': case 'find': case 'zoom-in': case 'zoom-out': case 'settings': chrome.runtime.sendMessage(event.data); break;
            
            default: typeToInput(event.data);
        }
    }
}, false);


/*  

Possible:
    -have ctrl panel/keyboard idle-fade?
    -replace focus-reliance with a class?
    -section navigation: grey out non-active sections?

To do now:    
    -make explanatory webpage / demo
    -autoscan w/ variable speed
    -variable key codes and typing abilities in popup.js
        
To do later:
    -querying the active tab only works if 1 window open
    -improve sectioning heuristics (always)
    -add bookmarking functions
    -other browser/window controls (larger history, window resizing/snapping/manipulation, volume controls)
    -connect the "search" function with link selection
    -allow user to create page-specific buttons for common actions
    -store keyboards as json objects and allow different layouts
    -clean/refactor/improve efficiency of code

Ongoing issues:
-email sites don't work
-more possible selectors for submit buttons

https://github.com/jjallen37/ChromeFormSwitch
https://object.io/site/2011/enter-git-flow/
mousetrap (create keyboard shortcuts) 
-https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

*/
