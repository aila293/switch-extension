var pending_recursions = 1;
function traverseFolder(folder_node, $ul){
    var children = folder_node.children;
    for (var i=0; i< children.length;i++){
        var url = children[i].url;
        if (url){
            $ul.append("<a href='"+ url +"'>"+children[i].title+"</a>");            
        } else if (children[i].title == "Bookmarks bar"){
            pending_recursions++;
            traverseFolder(children[i], $ul);
        } else {
            $ul.append("<li>"+children[i].title+ " (folder)"+"</li>");
            var sub_ul = document.createElement("ul");
            $ul.append(sub_ul);
            pending_recursions++;
            traverseFolder(children[i], $(sub_ul));
        }
    }
    pending_recursions--;
    if (pending_recursions == 0){
        setupNavigation();
    }
};

function setupNavigation(){
    var buttons = $("#buttons");
    buttons.remove();
    $("#root").append(buttons);
    
    
    $("a, ul, section, button").each(function(i,el){
        this.tabIndex=i;
    });
    
    initiateAutoscan(function(){
        $('ul:not("#root"),a,section,button').keydown(function(e){
            processKeydown(e);    
        });   
    }, processKeydown);
    
    resetFocus();
}

function resetFocus(){
    $("#root").find('a,ul').first().focus();    
}

function processKeydown(e){
    e.stopPropagation();
    e.preventDefault();    
    var target = e.target;

    if (e.which == settings.select_code){
        if (settings.autoscan && !(autoscan_on)){ 
            startScan(); 
        } else {
            switch(target.tagName){
                case 'A': target.click(); stopScan(); break;
                case 'BUTTON': stopScan(); processButton(target.id); break;
                default: resetTime(); $(target).children().first().focus();
            } 
        }
        
    //iterate links and uls (folders)
    } else if (e.which == settings.scan_code){
        var next = $(target).nextAll("a,ul,section,button").first();
        if (next.length==0){
            var parent = $(target).parent();
            if (parent.is("#root")){
                resetFocus();
            } else {
                parent.focus();
            }
        } else {
            next.focus();
        }
    }   
}

function processButton(id){
    switch (id){
        case 'close': closePage(); break;
        case 'delete': 
            
            //let user scan multiple bookmarks to delete
            break;
        case 'add-folder': 
            //popup with name and which parent
            break;
        case 'move-to-folder': 
            //select folder and multiple bookmarks
            break;
    }
}

function closePage(){
    chrome.tabs.query({active: true, lastFocusedWindow:true}, function(tabs){
            chrome.tabs.remove(tabs[0].id);
    });
}

$(document).ready(function(){
    chrome.bookmarks.getTree(function(results){  
        traverseFolder(results[0], $("#root"));
    });
});