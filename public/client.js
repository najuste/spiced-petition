var canvas = $("#canvas");
var cont = canvas[0].getContext("2d");
// var cont = document.getElementById("canvas").getContext("2d");

cont.strokeStyle = "grey";
cont.lineWidth = 1;

canvas.on("mousedown", function(e) {
    cont.beginPath();
    cont.moveTo(e.offsetX, e.offsetY);
    canvas.on("mousemove", function(e) {
        cont.lineTo(e.offsetX, e.offsetY);
        cont.stroke();
    });
});
canvas.on("mouseup", function() {
    canvas.off("mousemove");
    const dataURL = document.getElementById("canvas").toDataURL();
    $("#input-canvas").val(dataURL);
});

var first = $("input[name='first']");
var last = $("input[name='last']");

$("form").submit(function(e) {
    console.log(
        "On button submit",
        $("input[name='first']").val(),
        "empty right?"
    );
    if (
        first.val() == "" ||
        last.val() == "" ||
        $("#input-canvas").val() == ""
    ) {
        console.log("input is wrong", canvas.width(), canvas.height());
        $(".error-msg").css("display", "block");
        e.preventDefault();
        first.val("");
        last.val("");
        console.log();
        cont.clearRect(0, 0, 300, 100);
    }
});
