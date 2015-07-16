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
            $ul.append("<li>"+children[i].title+"</li>");
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
    $("a, ul").each(function(i,el){
        this.tabIndex=i;
    });
    
    initiateAutoscan(function(){
        $('ul:not("#root"),a').keydown(function(e){
            processKeydown(e);    
        });   
    }, processKeydown);
    
    $("#root").find('a').first().focus();
}

/*
function processKeydownWithFolders(e){
    e.stopPropagation();
    e.preventDefault();    
    var target = e.target;

    if (e.which == settings.select_code){
        if (settings.autoscan && !(autoscan_on)){ 
            startScan(); 
        } else {
            if (target.tagName == "A"){
                target.click();
            } else {
                $(target).children().first().focus();
            }
        }
    } else if (e.which == settings.scan_code){
        var next = $(target).next();
        if (target.tagName == "A"){
            next = $(target).parent();
        }
        next = next.prevAll().first();
        next.focus();
    }   
}
*/

function processKeydown(e){
    e.stopPropagation();
    e.preventDefault();    
    var target = e.target;

    if (e.which == settings.select_code){
        if (settings.autoscan && !(autoscan_on)){ 
            startScan(); 
        } else {
            stopScan();
            target.click();
        }
    } else if (e.which == settings.scan_code){
        var links = $("a");
        var index = links.index(target);
        if (index == links.length -1) index=-1;
        $(links[index+1]).focus();
    }   
}

function giveFocus(target){
    if (target.tagName == "LI"){
        $(target).next().focus();
    } else {
        $(target).focus();
    }
}

$(document).ready(function(){
    chrome.bookmarks.getTree(function(results){  
        traverseFolder(results[0], $("#root"));
    });
});