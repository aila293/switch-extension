
//in popup, submits if either key is hit. 
    $(document).keydown(function(e){
        chrome.storage.sync.get({
            scan_code: 9,
            select_code: 13
        }, function(items){
            if (e.which == items.scan_code 
               || e.which == items.select_code){
                background.postMessage(["change-url", $('input').val()], "*");
                closeWindow(); 
            }
        });
    });


function labelKey(index, name){ //for keys that need different content/appearance. index = place in 'other' array
    $('#punctuation1').children()[index].id = name;
    var host = document.getElementById(name);
    var root = host.createShadowRoot();
    root.textContent = name;
}


//docking stuff
   
    //docking setup
    var html =  document.documentElement;
    html.style.overflow = 'auto';
    document.body.style.maxHeight = '100%';

    document.body.style.overflow = ''; //undocks this space
    
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



//code for obsolete next-link / select-link buttons
            // for the event listener switch
            case 'next-link': nextLink();
                break;
            case 'select-link':
                $('.currently-selected-link')[0].click();
                break;
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


//Unused snippet for top-level DOM mapping. Looks for twice-nested link patterns ("div div a"). Seems to not make a difference
 var great_grandparent = grandparent.parent(); 
            var type2 = grandparent[0].tagName.toLowerCase();
            if (great_grandparent.children(type2).
                children(type).children('.conceptual-section').length > 1){
                great_grandparent.addClass('conceptual-section');
                great_grandparent.find('.conceptual-section').removeClass('conceptual-section');
            }

// docking using body wrapper
//must remove previous appendChild(keyboard) 
//and change scope of 'var keyboard' to work

function dockKeyboard(){ 
    if ($('#my_body_wrapper').length !== 0){return;}
    var div = document.createElement('div');
    div.id='my_body_wrapper';
    div.style.overflow='scroll';
    $('body').wrapInner(div);
    
     window.onresize = function (){
     $('#my_body_wrapper').height(window.innerHeight - 240);
    };
    document.body.appendChild(keyboard);
}


/*              Debugging snippets          */


//log first  iframe 
    $(document).click(function(){
        console.log("click");
        console.log($('iframe')[0]);
        $('iframe')[0].click();
    });
    

// log scrollTop of all elements
    $(document).click(function(){
        var elements = $('*');
        for (var i=0;i<elements.length;i++){
            if (elements[i].scrollTop > 0) {
                console.log(elements[i]);
            }
        }
        alert('done');
    });
               
//log bounding client rect
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