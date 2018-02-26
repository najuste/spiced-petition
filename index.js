const db = require("./db");
const hb = require("express-handlebars");
var bcrypt = require("bcryptjs");
const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
app.engine("handlebars", hb());
app.set("view engine", "handlebars"); // set reserved names

//------ SETTING COOKIES
var cookieSession = require("cookie-session");
app.use(
    cookieSession({
        // FIXME: secret
        secret: "a really hard to guess secret",
        // TODO: NEXT LINE ONLY FOR TESTING
        maxAge: 1000 * 60 * 5
        // maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

// const checkLogged = app.use(function(req, res, next) {
//     if (
//         req.session.loggedin &&
//         req.url !== "/register" &&
//         req.url !== "/login"
//     ) {
//         next();
//     } else {
//         res.redirect("/register");
//     }
// });

// const checkSigned = app.use(function(req, res, next) {
//     if (req.session.signId) {
//         res.redirect("/thanks");
//     } else {
//         next();
//     }
// });

app.use(function(req, res, next) {
    if (req.session.loggedin) {
        if (req.url !== "/register" && req.url !== "/login") {
            //if logged in & not accessing registration or login, let him in
            next();
        } else {
            res.redirect("/petition");
        }
    } else {
        if (
            !req.session.loggedin &&
            (req.url == "/register" || req.url == "/login")
        ) {
            next(); //if not logged in and accessing register or login, let him access
        } else {
            res.redirect("/register");
        }
    }
});

app.get("/register", function(req, res) {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", function(req, res) {
    let user_id;
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    hashPassword(req.body.password)
        .then(password => {
            console.log(req.body.password);

            //check if user already registered /if email exists in db

            return db.register(first, last, email, password).then(results => {
                console.log(
                    "Registering user, getting his id",
                    results.rows[0].id
                );
                user_id = results.rows[0].id;
                req.session.loggedin = { first, last, user_id };
                res.redirect("/info");
            });
        })
        .catch(function(err) {
            console.log("Error in registration, if no user id: register ", err);
            if (!user_id) {
                res.render("register", {
                    layout: "main"
                });
            }
        });
});

app.get("/info", function(req, res) {
    res.render("info", {
        layout: "main",
        first: req.session.loggedin.first,
        last: req.session.loggedin.last
    });
});

app.post("/info", function(req, res) {
    var city = req.body.city;
    var homepage = req.body.homepage;
    if (!city.length) {
        console.log("city going to lowercase", city);
        city = city.toLowerCase();
    }
    if (!homepage.length) {
        console.log("homepage going to lowercase", homepage);

        homepage = homepage.toLowerCase();
    }
    console.log("Checking the city:", city);
    // FIXME: age empty param as string is not handled when inserting to int
    db
        .storeInfo(req.body.age, city, homepage, req.session.loggedin.user_id)
        .then(results => {
            console.log("Storing info results", results);
            res.redirect("/petition");
        })
        .catch(function(err) {
            console.log("Logging error", err);
        });
});

app.get("/login", function(req, res) {
    if (req.session.loggedin) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/login", function(req, res) {
    let email = req.body.email;
    db
        .getDataByEmail(email)
        .then(results => {
            console.log(results.rows);

            if (!results.rows.length) {
                res.render("login", {
                    layout: "main",
                    // TODO: maybe other solution?
                    error: `The email you have entered does not match any client of yours. Please check if you typed it correctly`
                });
                console.log("no such email was ever entered");
            } else {
                results = results.rows[0];
                return checkPassword(req.body.password, results.password).then(
                    val => {
                        if (val) {
                            req.session.loggedin = {
                                first: results.first,
                                last: results.last,
                                user_id: results.id
                            };

                            // check also user has signed
                            db
                                .getSignId(req.session.loggedin.user_id)
                                .then(results => {
                                    console.log(
                                        "Getting the user_id from signatures",
                                        results
                                    );
                                    if (results.rows[0]) {
                                        req.session.loggedin.sign_id =
                                            results.rows[0].id;
                                        console.log(
                                            "Got the id inside the cookies",
                                            req.session.loggedin.sign_id
                                        );
                                    }
                                })
                                .catch(function(err) {
                                    console.log("Logging error", err);
                                });

                            res.redirect("/petition");
                        } else {
                            res.render("login", {
                                layout: "main",
                                // TODO: maybe other solution?
                                error: `The password you have entered does not match the given email. Please check if you typed correctly`
                            });
                            console.log("log in was not correct");
                        }
                    }
                );
            }
        })
        .catch(function(err) {
            console.log("Logging error", err);
        });
});

//MIDDLEWARE inside checking if not signed yet
app.get("/petition", function(req, res) {
    if (req.session.loggedin.sign_id) {
        res.redirect("/petition/thanks");
    } else {
        res.render("petition", {
            layout: "main",
            first: req.session.loggedin.first,
            last: req.session.loggedin.last
        });
    }
});

app.post("/petition", function(req, res) {
    let sign = req.body.sign;
    // updating database
    db
        .signPetition(sign, req.session.loggedin.user_id)
        .then(function(results) {
            req.session.loggedin.sign_id = results.rows[0].id;
            res.redirect("/petition/thanks");
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/petition/thanks", function(req, res) {
    if (req.session.loggedin.sign_id) {
        //get the id data
        db
            .getSignatureById(req.session.loggedin.sign_id)
            .then(function(results) {
                res.render("thanks", {
                    signature: results.rows[0].sign,
                    layout: "main"
                });
            });
    } else {
        res.render("petition", {
            layout: "main",
            first: req.session.loggedin.first,
            last: req.session.loggedin.last
        });
    }
});

app.get("/petition/signers", function(req, res) {
    db
        .getSignees(30) // limiting results
        .then(function(results) {
            console.log("Getting signers:", results);
            res.render("signees", {
                data: results.rows,
                layout: "main"
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/petition/signers/:city", function(req, res) {
    console.log("logging the city", req.params.city);
    db
        .getSigneesByCity(req.params.city, 30) // limiting results
        .then(function(results) {
            console.log("Getting signers in the city:", results.rows[0]);
            res.render("signees", {
                req_city: req.params.city,
                data: results.rows,
                layout: "main"
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.listen(8080, () => console.log("I am here for you"));

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
