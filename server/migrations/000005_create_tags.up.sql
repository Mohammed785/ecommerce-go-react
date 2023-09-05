CREATE TABLE IF NOT EXISTS tbl_tag(
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tbl_product_tags(
    product_id INT,
    tag_id INT,
    PRIMARY KEY(product_id,tag_id),
    FOREIGN KEY(product_id) REFERENCES tbl_product(id) ON DELETE CASCADE,
    FOREIGN KEY(tag_id) REFERENCES tbl_tag(id) ON DELETE CASCADE
);