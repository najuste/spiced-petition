var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

exports.get = function(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.setex = function(key, exp, set) {
    return new Promise(function(resolve, reject) {
        client.setex(key, exp, set, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports.del = function(key) {
    return new Promise(function(resolve, reject) {
        client.del(key, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
