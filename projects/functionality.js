
var $ = function(value){
    return document.querySelector(value);
}

var displays;

var project1_desc = function(){
    reset_displays();
    displays[0].style.display = "block";
}

var project2_desc = function(){
    reset_displays();
    displays[1].style.display = "block";
}

var project3_desc = function(){
    reset_displays();
    displays[2].style.display = "block";
}

var reset_displays = function(){
    displays.forEach(element => {
        element.style.display = "none";
    });
}


onload = function(){
    $("#project1_desc").addEventListener("click", project1_desc);
    $("#project2_desc").addEventListener("click", project2_desc);
    $("#project3_desc").addEventListener("click", project3_desc);
    displays = [$("#display1"), $("#display2"), $("#display3")];
}