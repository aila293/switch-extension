function setTabIndex(){
    var i =1;
    $('button,div').each(function(index){
       this.tabIndex = i++; 
    });
}

function setFirstSectionFocus(){$('div').first().focus();}
function setNextSectionFocus(div){$(div).next().focus();};
function setParentFocus(button){$(button).parent().focus();}
function setChildFocus(div){$(div).children().first().focus();}
function setFirstSiblingFocus(button){$(button).parent().children().first().focus();}
 

document.addEventListener('DOMContentLoaded', function() {
//window.addEventListener('load', function() {

    setTabIndex();
    
    $('button').keydown(function(e){
        e.stopPropagation();
        if (e.which===13){  //enter
            window.parent.postMessage(this.id, "*")
            setFirstSiblingFocus(this);
        } else if (e.which === 9){  //tab   
            if ($(this).next().length == 0){ //if last button in section
                e.preventDefault();
                setParentFocus(this);
            }
        }
    });
    
    $('div').keydown(function(e){
        e.stopPropagation();
        e.preventDefault();
        
        if (e.which===13){ //enter
            setChildFocus(this);
        } else if (e.which === 9){ //tab
            if ($(this).next().length == 0){
                setFirstSectionFocus();
            } else {
                setNextSectionFocus(this);
            }            
        }
    });
    
    setFirstSectionFocus();
    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//         console.log(message);
        if (message === 'refocus'){
            resetFocus(); 
        }  
    });
});
