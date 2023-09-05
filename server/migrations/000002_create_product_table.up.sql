CREATE TABLE IF NOT EXISTS tbl_category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tbl_sub_category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    parent_id INT NOT NULL,
    FOREIGN KEY(parent_id) REFERENCES tbl_category(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_product(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    sku CHAR(16) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    category_id INT,
    FOREIGN KEY(category_id) REFERENCES tbl_sub_category(id) ON DELETE SET NULL
);

ALTER TABLE tbl_product ADD COLUMN IF NOT EXISTS search tsvector GENERATED ALWAYS AS (to_tsvector('english',name)) STORED;
CREATE INDEX IF NOT EXISTS tbl_product_sku_idx  ON tbl_product(sku);
CREATE INDEX IF NOT EXISTS tbl_product_category_id_idx  ON tbl_product(category_id);
CREATE INDEX IF NOT EXISTS tbl_product_search_idx  ON tbl_product USING GIN(search);

CREATE TABLE IF NOT EXISTS tbl_attribute(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    attribute_type VARCHAR(10) CHECK(attribute_type IN ('text','number','date','time','datetime')) DEFAULT 'text'
);

CREATE TABLE IF NOT EXISTS tbl_category_attribute(
    attribute_id INT,
    category_id INT,
    PRIMARY KEY(attribute_id,category_id),
    FOREIGN KEY(attribute_id) REFERENCES tbl_attribute(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES tbl_sub_category(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_product_attribute(
    product_id INT,
    attribute_id INT,
    value VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id,attribute_id),
    FOREIGN KEY(product_id) REFERENCES tbl_product(id) ON DELETE CASCADE,
    FOREIGN KEY(attribute_id) REFERENCES tbl_attribute(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tbl_product_attribute_product_id ON tbl_product_attribute(product_id);