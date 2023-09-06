DROP TABLE IF EXISTS tbl_product_m2m_tags CASCADE;
DROP TABLE IF EXISTS tbl_category_attribute CASCADE;
DROP TABLE IF EXISTS tbl_product_attribute CASCADE;
DROP TABLE IF EXISTS tbl_attribute CASCADE;
DROP TABLE IF EXISTS tbl_category CASCADE;
DROP TABLE IF EXISTS tbl_product CASCADE;

DROP INDEX IF EXISTS tbl_product_sku_idx;
DROP INDEX IF EXISTS tbl_product_category_id_idx;
DROP INDEX IF EXISTS tbl_product_attribute_attribute_id;
DROP INDEX IF EXISTS tbl_product_attribute_product_id;
