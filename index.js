const db = require("./db");
const hb = require("express-handlebars");
const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
app.use(require("cookie-parser")());

app.use(function(req, res, next) {
    //
    if (!req.cookies.signed && req.url !== "/petition") {
        // you have to make sure if user is going to cookie page not to redirect there
        res.redirect("/petition");
    } else if (req.cookies.signed && req.url == "/petition") {
        // you have to make sure if user is going to cookie page not to redirect there
        res.redirect("/thanks");
    } else {
        next();
    }
});

app.engine("handlebars", hb());
app.set("view engine", "handlebars"); // set reserved names

app.get("/petition", function(req, res) {
    res.render("petition", {
        layout: "main"
    });
});
app.post("/petition", function(req, res) {
    let first = req.body.first;
    let last = req.body.last;
    let sign = req.body.signature;
    // updating database
    db
        .signPetition(first, last, sign)
        .then(function(results) {
            console.log(results.rows);
        })
        .catch(function(err) {
            console.log(err);
        });
    //set cookies
    res.cookie("signed", "true");
    res.redirect("/thanks");
});

app.get("/thanks", function(req, res) {
    res.render("thanks", {
        layout: "main"
    });
});
app.get("/signees", function(req, res) {
    // access database & populate results
    db
        .getSignees()
        .then(function(results) {
            console.log(results.rows);
            res.render("signees", {
                data: results.rows,
                layout: "main"
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.listen(8080, () => console.log("I am here for you"));
