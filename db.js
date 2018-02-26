var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

//inserting data into sql
exports.register = function(firstname, lastname, email, hash) {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES($1, $2, $3, $4) RETURNING id`,
        [firstname, lastname, email, hash]
    );
};

exports.getDataByEmail = function(email) {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
};

exports.signPetition = function(signature, user_id) {
    return db.query(
        `INSERT INTO signatures (sign, user_id) VALUES($1, $2) RETURNING id`,
        [signature, user_id]
    );
};

exports.getSignees = function(limit) {
    return db.query(
        // `SELECT first AS "first", last AS "last" FROM signatures ORDER BY id DESC LIMIT ${limit}`
        `SELECT signed.first, signed.last, user_profiles.age, user_profiles.city, user_profiles.homepage
        FROM
            (SELECT * FROM
            users
            JOIN
            signatures ON users.id = signatures.user_id WHERE signatures.id IS NOT NULL) signed
        JOIN user_profiles ON signed.user_id = user_profiles.user_id
        ORDER BY signed.user_id DESC LIMIT ${limit}`
    );
};

exports.getSigneesByCity = function(city, limit) {
    return db.query(
        // `SELECT first AS "first", last AS "last" FROM signatures ORDER BY id DESC LIMIT ${limit}`
        `SELECT signed.first, signed.last, user_profiles.age, user_profiles.city, user_profiles.homepage
        FROM
            (SELECT * FROM
            users
            JOIN
            signatures ON users.id = signatures.user_id WHERE signatures.id IS NOT NULL) signed
        JOIN user_profiles ON signed.user_id = user_profiles.user_id
        WHERE user_profiles.city = '${city}'
        ORDER BY signed.user_id DESC LIMIT ${limit}`
    );
};

exports.getSignatureById = function(sign_id) {
    return db.query(`SELECT sign FROM signatures WHERE id = ${sign_id}`);
};

exports.getSignId = function(user_id) {
    return db.query(`SELECT id FROM signatures WHERE user_id = ${user_id}`);
};

exports.storeInfo = function(age, city, homepage, user_id) {
    // TODO:  how to store empty value as integer
    //(node:3530) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): error: invalid input syntax for integer: ""

    return db.query(
        `INSERT INTO user_profiles (age, city, homepage, user_id) VALUES($1, $2, $3, $4)`,
        [age, city, homepage, user_id]
    );
};
