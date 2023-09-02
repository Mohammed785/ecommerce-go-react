CREATE TABLE IF NOT EXISTS tbl_review(
    comment TEXT,
    rate SMALLINT NOT NULL CHECK(rate<=5 AND rate>=1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_id INT,
    user_id INT,
    PRIMARY KEY(user_id,product_id),
    FOREIGN KEY(product_id) REFERENCES tbl_product(id),
    FOREIGN KEY(user_id) REFERENCES tbl_user(id)
);

CREATE INDEX IF NOT EXISTS tbl_review_product_id_idx ON tbl_review(product_id);
CREATE INDEX IF NOT EXISTS tbl_review_user_id_idx ON tbl_review(user_id);
