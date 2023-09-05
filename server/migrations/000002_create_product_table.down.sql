DROP TABLE IF EXISTS tbl_product;
DROP TABLE IF EXISTS tbl_product_m2m_tags;
DROP TABLE IF EXISTS tbl_attribute;
DROP TABLE IF EXISTS tbl_category_attribute;
DROP TABLE IF EXISTS tbl_product_attribute;
DROP TABLE IF EXISTS tbl_category;
DROP TABLE IF EXISTS tbl_sub_category;

DROP INDEX IF EXISTS tbl_product_sku_idx;
DROP INDEX IF EXISTS tbl_product_category_id_idx;
DROP INDEX IF EXISTS tbl_product_attribute_attribute_id;
DROP INDEX IF EXISTS tbl_product_attribute_product_id;