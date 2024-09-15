CREATE TABLE job_data (
    id INTEGER PRIMARY KEY,
    job_title VARCHAR,
    democrat INTEGER,
    republican INTEGER,
    mixed INTEGER,
    CONSTRAINT unique_job_title UNIQUE (job_title)
);
