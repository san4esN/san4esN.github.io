var colratio = Math.floor(1077/73);
var backMarginRatio = 1011/815;
// $('.search-group').width($('body').width()/backMarginRatio);
$("#Content .art-container_cont-text").attr("cols",Math.floor($("body").width()/colratio));
$(window).resize(function(){
    $("#Content .art-container_cont-text").attr("cols",Math.floor($("body").width()/colratio));
    // $('.search-group').width($('body').width()/backMarginRatio);
})
