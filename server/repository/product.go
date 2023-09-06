package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)


type productRepository struct {}

var ProductRepository *productRepository = &productRepository{}

func (p *productRepository) Search(keyword string,pagination *helpers.PaginationOptions)(products []models.ProductSearch,err error){
	query := `SELECT p.id,p.name,p.price,im.img_name AS image,cat.id AS "cat.id",cat.name AS "cat.name",
	ts_rank(search,websearch_to_tsquery('english',$1)) AS rank FROM tbl_product p 
	LEFT JOIN tbl_sub_category AS cat ON p.category_id=cat.id LEFT JOIN tbl_product_image im ON im.product_id=p.id 
	AND im.primary_img=true WHERE search @@ websearch_to_tsquery('english',$1) ORDER BY rank DESC LIMIT $2`
	err=globals.DB.Select(&products,query,keyword,pagination.Limit)
	return
}

func (p *productRepository) Find(conditions goqu.Ex,pagination *helpers.PaginationOptions,cols... interface{}) (products []models.ProductFind,err error){
	query:= globals.Dialect.From("tbl_product").Select(cols...).Limit(pagination.Limit)
	if pagination.OrderBy=="desc"{
		conditions["id"] = goqu.Op{"lt":pagination.Cursor}
		query = query.Order(goqu.C("id").Desc())
	}else{
		conditions["id"] = goqu.Op{"gt":pagination.Cursor}
		query = query.Order(goqu.C("id").Asc())
	}

	query = query.Where(conditions)
	sql,_,_:=query.ToSQL()
	err=globals.DB.Select(&products,sql)
	return
}

func (p *productRepository) FindOne(identifier string)(product models.Product,err error) {
	err= globals.DB.Get(&product,`SELECT product.*,cat.name AS category_name FROM tbl_product product
LEFT JOIN tbl_category cat ON cat.id=product.category_id
WHERE (product.id=$1 OR product.sku=CAST($1 AS VARCHAR)) AND deleted_at IS NULL`,identifier)
	if err!=nil{
		return product,err
	}
	err = globals.DB.Select(&product.Attributes,"SELECT attr.id,pa.value,attr.attribute_type FROM tbl_product_attribute pa JOIN tbl_attribute attr ON attr.id=pa.attribute_id WHERE product_id=$1",product.Id)
	return product,err
}

func (p *productRepository) Create(product interface{},attributes []models.ProductAttribute) (int,error){
	sql,_,_ := globals.Dialect.Insert("tbl_product").Rows(product).Returning("id").ToSQL()
	var Id int;
	tx,err:=globals.DB.Beginx();
	if err!=nil{
		return 0,err
	}
	res := tx.QueryRowx(sql)

	err=res.Scan(&Id)
	if err!=nil{
		tx.Rollback()
		return 0,err
	}
	for _,attr:= range attributes{
		_,err = tx.Exec("INSERT INTO tbl_product_attribute(product_id,attribute_id,value) VALUES($1,$2,$3)",Id,attr.AttributeId,attr.Value)
		if err!=nil{
			tx.Rollback()
			return 0,err
		}
	}
	err = tx.Commit()
	return Id,err
}

func (p *productRepository) AddImages(id string,images ...goqu.Record)error{
	sql,_,_:=globals.Dialect.Insert("tbl_product_image").Rows(images).ToSQL()
	_,err:= globals.DB.Exec(sql)
	return err
}
func (p *productRepository) UpdateImage(imgId ,productId string)(int64,error){
	result,err:= globals.DB.Exec("UPDATE tbl_product_image SET primary_img=CASE WHEN id=$1 THEN true ELSE false END WHERE product_id=$2",imgId,productId)
	if err!=nil{
		return 0,err
	}
	rows,err:=result.RowsAffected()
	return rows,err
}
func (p *productRepository) DeleteImages(ids []int)([]string,error){
	query,args,err := sqlx.In("DELETE FROM tbl_product_image WHERE id IN (?) RETURNING img_name",ids)
	if err!=nil{
		return nil,err
	}
	query = globals.DB.Rebind(query)
	names:=make([]string,0,len(ids))
	err = globals.DB.Select(&names,query,args...)
	return names,err
}

func (p *productRepository) Update(id string,data interface{}) (int64,error){
	sql,_,_:=globals.Dialect.Update("tbl_product").Where(goqu.C("id").Eq(id)).Where(goqu.C("deleted_at").Eq(nil)).Set(data).ToSQL()
	result,err:=globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	rows,err:=result.RowsAffected()
	return rows,err
}

func (p *productRepository) Delete(id string,hardDelete bool) (int64,error){
	var sql string;
	if hardDelete{
		sql = "DELETE FROM tbl_product WHERE id=$1"
	}else{
		sql ="UPDATE tbl_product SET deleted_at=now() WHERE id=$1 AND deleted_at IS NULL" 
	}
	result,err:=globals.DB.Exec(sql,id);
	if err!=nil{
		return 0,err
	}
	rows,err:=result.RowsAffected();
	return rows,err
}

func (p *productRepository) AddAttributes(id int,attributes... interface{})error{
	sql,_,_ := globals.Dialect.Insert("tbl_product_attribute").Rows(attributes...).ToSQL();
	_,err:=globals.DB.Exec(sql)
	return err
}
func (p *productRepository) RemoveAttribute(id string,attributes []int)error{
	query,args,err:=sqlx.In("DELETE FROM tbl_product_attribute WHERE product_id=? AND attribute_id IN (?)", id,attributes)
	if err!=nil{
		return err
	}
	query = globals.DB.Rebind(query)
	_,err=globals.DB.Exec(query,args...)
	return err
}
