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
var cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: "a really hard to guess secret",
        // TODO: NEXT LINE ONLY FOR TESTING
        maxAge: 1000 * 60 * 5
        // maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(function(req, res, next) {
    if (req.session.length == 0 && req.url !== "/petition") {
        res.redirect("/petition");
    } else if (req.session.signId && req.url == "/petition") {
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

var id;
app.post("/petition", function(req, res) {
    let first = req.body.first;
    let last = req.body.last;
    let sign = req.body.sign;
    // updating database
    db
        .signPetition(first, last, sign)
        .then(function(results) {
            id = results.rows[0].id;
            console.log("Id of user from db", results.rows[0].id);

            req.session.signId = id;
            res.redirect("/thanks");
        })
        .catch(function(err) {
            console.log(err);
        });
    //set cookie session //get the ID from the dB
});

app.get("/thanks", function(req, res) {
    if (req.session.signId) {
        //get the id data
        db.getId(id).then(function(results) {
            console.log(results);

            res.render("thanks", {
                resulted_id: results.rows[0].sign,
                layout: "main"
            });
        });
    } else {
        res.render("thanks", {
            layout: "main"
        });
    }
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
