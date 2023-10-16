CREATE OR REPLACE FUNCTION delete_product_attributes() RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.category_id!=OLD.category_id THEN
        DELETE FROM tbl_product_attribute WHERE product_id=OLD.id;
    END IF;
    RETURN OLD;
END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_delete_product_attribute
AFTER DELETE OR UPDATE OF category_id ON tbl_product
FOR EACH ROW
EXECUTE FUNCTION delete_product_attributes();
