CREATE TABLE IF NOT EXISTS tbl_user(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(25) NOT NULL,
    last_name VARCHAR(25) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender CHAR(1) NOT NULL CHECK(gender IN ('M','F')),
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS tbl_user_email_idx ON tbl_user(email);