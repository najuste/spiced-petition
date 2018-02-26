
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS signatures CASCADE;
CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    user_id SMALLINT REFERENCES users,
    sign TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- old version
-- DROP TABLE IF EXISTS signatures;
-- CREATE TABLE signatures(
--     id SERIAL PRIMARY KEY,
--     first VARCHAR(255) NOT NULL,
--     last VARCHAR(255) NOT NULL,
--     sign TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- user_id (tablename_keythere) -  foreign key, should be added to signatures
-- user_id INTEGER NOT NULL
-- will have to remove first and last


DROP TABLE IF EXISTS user_profiles CASCADE;


CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    user_id SMALLINT REFERENCES users,
    age SMALLINT DEFAULT null,
    city VARCHAR(255),
    homepage VARCHAR(255)
);
