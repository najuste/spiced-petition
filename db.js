var spicedPg = require("spiced-pg");

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./secrets.json");
}

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPass}@localhost:5432/signatures`
);

// INSERT NEW DATA

exports.register = function(firstname, lastname, email, hash) {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES($1, $2, $3, $4) RETURNING id`,
        [firstname, lastname, email, hash]
    );
};

exports.signPetition = function(signature, user_id) {
    return db.query(
        `INSERT INTO signatures (sign, user_id) VALUES($1, $2) RETURNING id`,
        [signature, user_id]
    );
};

exports.storeInfo = function(user_id, age, city, homepage) {
    return db.query(
        `INSERT INTO user_profiles (age, city, homepage, user_id) VALUES($1, $2, $3, $4)`,
        [age || null, city || null, homepage || null, user_id]
    );
};

// GET

exports.getDataByEmail = function(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
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
        WHERE user_profiles.city = $1
        ORDER BY signed.user_id DESC LIMIT ($2)`,
        [city, limit]
    );
};

exports.getSignatureById = function(sign_id) {
    return db.query(`SELECT sign FROM signatures WHERE id = $1`, [sign_id]);
};

exports.getSignId = function(user_id) {
    return db.query(`SELECT id FROM signatures WHERE user_id = $1`, [user_id]);
};

exports.getInfoById = function(id) {
    return db.query(`SELECT * FROM user_profiles WHERE user_id = $1`, [id]);
};

// exports.updateUserById = function(firstname, lastname, email, hash, user_id) {
//     return db.query(
//         `UPDATE user_profiles
//         SET first =$1, last = $2, email = $3,
//         password = COALESCE($4, password)
//         WHERE user_id = $5
//         AND $4 IS NOT NULL AND $4 IS DISTINCT FROM password`,
//         [firstname, lastname, email, hash, user_id]
//     );
// };

// UPDATES

exports.updateUserById_newPass = function(
    firstname,
    lastname,
    email,
    hash,
    user_id
) {
    return db.query(
        `UPDATE users
        SET first =$1, last = $2, email = $3, password = $4
        WHERE id = $5`,
        [firstname, lastname, email, hash, user_id]
    );
};
exports.updateUserById = function(firstname, lastname, email, user_id) {
    return db.query(
        `UPDATE users
        SET first =$1, last = $2, email = $3
        WHERE id = $4`,
        [firstname, lastname, email, user_id]
    );
};
exports.updateInfoById = function(age, city, homepage, user_id) {
    return db.query(
        `UPDATE user_profiles SET age=$1, city=$2, homepage=$3 WHERE user_id=$4`,
        [age || null, city || null, homepage || null, user_id]
    );
};

// DELETE

exports.delSignature = function(user_id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [user_id]);
};
