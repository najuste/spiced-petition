var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signees`);

//inserting data into sql

exports.signPetition = function(firstname, lastname, signature) {
    return db.query(
        `INSERT INTO signees (first, last, sign) VALUES($1, $2, $3) RETURNING id`,
        [firstname, lastname, signature]
    );
};

exports.getSignees = function() {
    return db.query(
        `SELECT first AS "first", last AS "last" FROM signees ORDER BY id DESC`
    );
};

exports.getId = function(id) {
    return db.query(`SELECT sign FROM signees WHERE id = ${id}`);
};
