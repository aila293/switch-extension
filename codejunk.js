
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