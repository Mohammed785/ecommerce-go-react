CREATE TABLE IF NOT EXISTS tbl_category(
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    parent_id INT,
    FOREIGN KEY(parent_id) REFERENCES tbl_category(id) ON DELETE SET NULL,
    UNIQUE NULLS NOT DISTINCT (name,parent_id)
);

CREATE TABLE IF NOT EXISTS tbl_product(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    sku CHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    category_id INT,
    FOREIGN KEY(category_id) REFERENCES tbl_category(id) ON DELETE SET NULL
);

ALTER TABLE tbl_product ADD COLUMN IF NOT EXISTS search tsvector GENERATED ALWAYS AS (to_tsvector('english',name)) STORED;
CREATE INDEX IF NOT EXISTS tbl_product_sku_idx  ON tbl_product(sku);
CREATE INDEX IF NOT EXISTS tbl_product_category_id_idx  ON tbl_product(category_id);
CREATE INDEX IF NOT EXISTS tbl_product_search_idx  ON tbl_product USING GIN(search);

CREATE TABLE IF NOT EXISTS tbl_attribute(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tbl_attribute_value(
    id SERIAL PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    attribute_id INT NOT NULL,
    FOREIGN KEY(attribute_id) REFERENCES tbl_attribute(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tbl_attribute_value_attribute_id_idx ON tbl_attribute_value(attribute_id);

CREATE TABLE IF NOT EXISTS tbl_category_attribute(
    attribute_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY(attribute_id,category_id),
    FOREIGN KEY(attribute_id) REFERENCES tbl_attribute(id) ON DELETE CASCADE,
    FOREIGN KEY(category_id) REFERENCES tbl_category(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS tbl_category_attribute_category_id ON tbl_category_attribute(category_id);

CREATE TABLE IF NOT EXISTS tbl_product_attribute(
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    value_id INT NOT NULL,
    PRIMARY KEY (product_id,attribute_id),
    FOREIGN KEY(product_id) REFERENCES tbl_product(id) ON DELETE CASCADE,
    FOREIGN KEY(attribute_id) REFERENCES tbl_attribute(id) ON DELETE CASCADE,
    FOREIGN KEY(value_id) REFERENCES tbl_attribute_value(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS tbl_product_attribute_product_id ON tbl_product_attribute(product_id);