const db = require("./db");
const cache = require("./redismodule");

const hb = require("express-handlebars");
var bcrypt = require("bcryptjs");
var csurf = require("csurf");

const express = require("express");

const app = express();

// //// tests
//
// cache
//     .setex(
//         "goodstuff",
//         5,
//         JSON.stringify({
//             good: "day",
//             great: "evening"
//         })
//     )
//     .then(() => cache.get("goodstuff").then(res => console.log(res)));
//
// ////

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
        secret:
            process.env.SESSION_SECRET ||
            require("./secrets.json").cookieSecret,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

//
var csrf = csurf();

app.use(function(req, res, next) {
    if (req.session.loggedin) {
        if (req.url !== "/register" && req.url !== "/login") {
            next(); //if logged in & not accessing registration or login, let him in
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
app.get("/", csrf, function(req, res) {
    res.redirect("/register");
});

app.get("/register", csrf, function(req, res) {
    res.render("register", {
        layout: "main",
        csrfToken: req.csrfToken()
    });
});

app.post("/register", csrf, function(req, res) {
    let user_id;
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;

    hashPassword(req.body.password)
        .then(password => {
            return db.register(first, last, email, password).then(results => {
                user_id = results.rows[0].id;
                return db.storeInfo(user_id).then(() => {
                    req.session.loggedin = { first, last, email, user_id };
                    res.redirect("/info");
                });
            });
        })
        .catch(function(err) {
            if (err.code == "23505") {
                res.render("register", {
                    csrfToken: req.csrfToken(),
                    error:
                        "User with an email you just typed in already registered",
                    layout: "main"
                });
            } else {
                res.render("register", {
                    csrfToken: req.csrfToken(),
                    error: "Undefined error occured, please try again",
                    layout: "main"
                });
            }
        });
});

app.get("/info", csrf, function(req, res) {
    if (req.session.loggedin.info) {
        res.redirect("/petition/edit");
    }

    res.render("info", {
        layout: "main",
        csrfToken: req.csrfToken(),
        first: req.session.loggedin.first,
        last: req.session.loggedin.last
    });
});

app.post("/info", csrf, function(req, res) {
    let city = req.body.city.toLowerCase();
    let homepage = req.body.homepage;

    req.session.loggedin.info = true;
    db
        .updateInfoById(
            req.body.age,
            city,
            homepage,
            req.session.loggedin.user_id
        )
        .then(() => {
            res.redirect("/petition");
        })
        .catch(err => {
            console.log(err);
            res.redirect("/petition/edit");
        });
});

app.get("/petition/edit", csrf, function(req, res) {
    const { first, last, email } = req.session.loggedin;
    const user_id = req.session.loggedin.user_id;
    db
        .getInfoById(user_id)
        .then(results => {
            if (results.rows.length) {
                const { age, city, homepage } = results.rows[0];
                //populate the form with values
                const data = { first, last, email, age, city, homepage };
                res.render("edit", {
                    layout: "main",
                    csrfToken: req.csrfToken(),
                    data: data
                });
            } else {
                // FIXME:   //the query was empty, so no input from user
                res.render("edit", {
                    layout: "main",
                    csrfToken: req.csrfToken(),
                    data: req.session.loggedin
                });
            }
        })
        .catch(err => console.log(err));
});

app.post("/petition/edit", csrf, function(req, res) {
    var { first, last, email, new_password, age, city, homepage } = req.body;
    city = city.toLowerCase();

    if (!new_password) {
        //no password passed, no need to hash

        db
            .updateUserById(first, last, email, req.session.loggedin.user_id)
            .then(() => {
                return db
                    .updateInfoById(
                        age,
                        city,
                        homepage,
                        req.session.loggedin.user_id
                    )
                    .then(() => {
                        res.redirect("/petition");
                    });
            })
            .catch(err => console.log(err));
    } else {
        //hash password
        hashPassword(new_password)
            .then(password => {
                return db
                    .updateUserById_newPass(
                        first,
                        last,
                        email,
                        password,
                        req.session.loggedin.user_id
                    )
                    .then(() => {
                        return db
                            .updateInfoById(
                                age,
                                city,
                                homepage,
                                req.session.loggedin.user_id
                            )
                            .then(() => {
                                res.redirect("/petition");
                            });
                    });
            })
            .catch(err => console.log(err));
    }
});

app.get("/login", csrf, function(req, res) {
    if (req.session.loggedin) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    }
});

app.post("/login", csrf, function(req, res) {
    let email = req.body.email;
    db
        .getDataByEmail(email)
        .then(results => {
            if (!results.rows.length) {
                res.render("login", {
                    layout: "main",
                    error: `The email you have entered does not match any client of yours. Please check if you typed it correctly`
                });
            } else {
                results = results.rows[0];
                return checkPassword(req.body.password, results.password).then(
                    val => {
                        if (!val) {
                            res.render("login", {
                                layout: "main",
                                error: `The password you have entered does not match the given email. Please check if you typed correctly`
                            });
                        } else {
                            req.session.loggedin = {
                                first: results.first,
                                last: results.last,
                                email: results.email,
                                user_id: results.id,
                                info: true
                            };
                            db
                                .getSignId(req.session.loggedin.user_id)
                                .then(results => {
                                    if (results.rows[0]) {
                                        req.session.loggedin.sign_id =
                                            results.rows[0].id;
                                        res.redirect("/petition/thanks");
                                    }
                                    res.redirect("/petition");
                                })
                                .catch(err => console.log(err));
                        }
                    }
                );
            }
        })
        .catch(err => console.log(err));
});

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
    db
        .signPetition(req.body.sign, req.session.loggedin.user_id)
        .then(results => {
            req.session.loggedin.sign_id = results.rows[0].id;
            res.redirect("/petition/thanks");
        })
        .catch(err => console.log(err));
});

app.get("/petition/thanks", function(req, res) {
    if (req.session.loggedin.sign_id) {
        db.getSignatureById(req.session.loggedin.sign_id).then(results => {
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

app.get("/cancelpetition", function(req, res) {
    db
        .delSignature(req.session.loggedin.user_id)
        .then(() => {
            delete req.session.loggedin.sign_id; //updating cookies
            res.redirect("/petition");
        })
        .catch(err => console.log(err));
});
app.get("/petition/signers", function(req, res) {
    db
        .getSignees(30) // limiting results
        .then(results => {
            res.render("signees", {
                data: results.rows,
                layout: "main"
            });
        })
        .catch(err => console.log(err));
});

app.get("/petition/signers/:city", function(req, res) {
    db
        .getSigneesByCity(req.params.city, 30) // limiting results
        .then(results => {
            res.render("signees", {
                req_city: req.params.city,
                data: results.rows,
                layout: "main"
            });
        })
        .catch(err => console.log(err));
});

app.listen(process.env.PORT || 8080, () => console.log("Nieko tokio"));

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
