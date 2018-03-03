var redis = require("redis");

const client = redis.createClient(
    process.env.REDIS_URL || { host: "localhost", port: 6379 }
);

client.on("error", function(err) {
    console.log(err);
});

exports.get = function(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

exports.setex = function(key, exp, set) {
    return new Promise(function(resolve, reject) {
        client.setex(key, exp, JSON.stringify(set), function(err, data) {
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
