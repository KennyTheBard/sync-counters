CREATE TABLE counters (
    uuid UUID PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    value INTEGER NOT NULL,
    created_at BIGINT NOT NULL
);
