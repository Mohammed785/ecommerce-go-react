CREATE TABLE IF NOT EXISTS tbl_product_image(
    id SERIAL PRIMARY KEY,
    img_name VARCHAR(255) NOT NULL UNIQUE,
    primary_img BOOLEAN DEFAULT false,
    product_id INT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES tbl_product(id) ON DELETE CASCADE
)