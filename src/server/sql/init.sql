DROP TABLE IF EXISTS user_guesses;
CREATE TABLE IF NOT EXISTS user_guesses (
    id INTEGER PRIMARY KEY, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    user_id TEXT,
    job_title TEXT,
    guess TEXT,
    correct BOOLEAN,
    comment TEXT
);

DROP TABLE IF EXISTS job_metrics;
CREATE TABLE IF NOT EXISTS job_metrics (
    id INTEGER PRIMARY KEY, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    job_title TEXT,
    democrat_count INTEGER,
    republican_count INTEGER,
    mixed_count INTEGER 
);

DROP TABLE IF EXISTS job_data;
CREATE TABLE job_data (
    id INTEGER PRIMARY KEY,
    job_title VARCHAR,
    democrat INTEGER,
    republican INTEGER,
    mixed INTEGER,
    CONSTRAINT unique_job_title UNIQUE (job_title)
);

DROP TABLE IF EXISTS user_summary;
CREATE TABLE user_summary (
    user_id VARCHAR PRIMARY KEY,
    total INTEGER,
    correct INTEGER,
    CONSTRAINT unique_user_id UNIQUE (user_id)
);

