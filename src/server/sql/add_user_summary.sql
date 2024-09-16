DROP TABLE IF EXISTS user_summary;
CREATE TABLE user_summary (
    user_id VARCHAR PRIMARY KEY,
    total INTEGER,
    correct INTEGER,
    CONSTRAINT unique_user_id UNIQUE (user_id)
);
