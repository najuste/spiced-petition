///
if ($("#start-page").length) {
    $("h1").css("opacity", "0");
    $("h1")
        .delay(1000)
        .animate({ opacity: 1 }, 3000);
}
/// canvas

//---- /register

if ($("form").length) {
    var first = $("input[name='first']");
    var last = $("input[name='last']");
    var email = $("input[name='email']");
    var password = $("input[name='password']");

    var signature = $("#input-canvas");

    $("#register-form").submit(function(e) {
        console.log("In register form");

        if (
            first.val() == "" ||
            last.val() == "" ||
            email.val() == "" ||
            password.val() == ""
        ) {
            $(".error-msg").val(
                "Please input data fully. No empty fields allowed"
            );
            e.preventDefault();
            first.val(""), last.val(""), email.val(""), password.val("");
            first.css("background", "pink");
            last.css("background", "pink");
            email.css("background-color", "pink");
            password.css("background-color", "pink");
        } else if (email.val().indexOf("@") < 0) {
            // FIXME: message was not appearing
            $("#sign-block .error-msg").html(
                `The email you typed is not valid`
            );
            e.preventDefault();
            email.css("background-color", "pink");
        }
    });

    //---- /login

    $("#login-form").submit(function(e) {
        if (email.val() == "" || password.val() == "") {
            $(".error-msg").val(
                "Please input data fully. We can't let you in."
            );
            e.preventDefault();
            email.val(""), password.val("");
            email.css("background-color", "pink");
            password.css("background-color", "pink");
        }
    });

    //---- /petition
    if ($("#canvas").length) {
        var canvas = $("#canvas");
        //var cont = canvas[0].getContext("2d");
        var cont = document.getElementById("canvas").getContext("2d");

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

        $("#sign-form").submit(function(e) {
            if (signature.val() == "") {
                $(".error-msg").val("Please sign, no scrible was recorded.");
                e.preventDefault();
                cont.clearRect(0, 0, 300, 100);
                canvas.css("background-color", "pink");
            }
        });
    }
}
