DROP TABLE IF EXISTS user_guesses;
CREATE TABLE IF NOT EXISTS user_guesses (
    id INTEGER PRIMARY KEY, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    user_id TEXT,
    job_title TEXT,
    guess TEXT,
    correct BOOLEAN
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
