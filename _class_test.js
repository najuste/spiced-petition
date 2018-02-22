var spicedPg = require("spiced-pg");
var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/actors`);

function getInfo(name, surname) {
    //parameters as user input
    //deal carefuly with user input
    //squel injection, like instead of the city one can say DROP DB(!)
    // so one needs to ++escape++ what user adds

    //db.query('SELECT * FROM cities').then(function(results)...
    db
        .query(`SELECT name FROM actors WHERE name = $1 AND surname = $2`, [
            name,
            surname
        ])
        .then(function(results) {
            console.log(results.rows);
            //console.log(results); --- plenty of other properties, that aren't interesting for now
            //rows are where results lay
        })
        .catch(function(err) {
            console.log(err);
        });
}

db.query(`INSERT INTO actors (name, age, numOscars)
            VALUES ('Crazy one', 10, 0)`);
