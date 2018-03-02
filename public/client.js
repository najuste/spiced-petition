// ---- start page animation
if ($("#start-page").length) {
    let h1 = $("h1");
    h1.css("opacity", "0.01");
    h1.delay(1000).animate({ opacity: 1 }, 3000);
}

//---- register
if ($("form").length) {
    var first = $("input[name='first']");
    var last = $("input[name='last']");
    var email = $("input[name='email']");
    var password = $("input[name='password']");

    var signature = $("#input-canvas");

    $("#register-form").submit(function(e) {
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
            //doing an email check
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
        var cont = document.getElementById("canvas").getContext("2d");

        cont.strokeStyle = "grey";
        cont.lineWidth = 1;

        canvas.on("mousedown", function(e) {
            canvas.css("background-color", "white");
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

        // on phone

        var canvasOffset = canvas.offset();
        var x, y;

        canvas.on("touchstart", function(e) {
            canvas.css("background-color", "white");
            e.preventDefault();
            cont.beginPath();
            x = e.touches[0].pageX - canvasOffset.left;
            y = e.touches[0].pageY - canvasOffset.top;
            cont.moveTo(x, y);
        });
        canvas.on("touchmove", function(e) {
            e.preventDefault();
            x = e.touches[0].pageX - canvasOffset.left;
            y = e.touches[0].pageY - canvasOffset.top;
            cont.lineTo(x, y);
            cont.stroke();

            const dataURL = document.getElementById("canvas").toDataURL();
            $("#input-canvas").val(dataURL);
        });

        $("#sign-form").submit(function(e) {
            if (signature.val() == "") {
                $(".error-msg").val("Please sign, nothing on canvas :/");
                e.preventDefault();
                cont.clearRect(0, 0, 300, 100);
                canvas.css("background-color", "pink");
            }
        });
        $("button#clear-canvas").on("click", function() {
            console.log("cleared");
            cont.clearRect(0, 0, 300, 100);
            canvas.css("background-color", "white");
        });
    }
}
