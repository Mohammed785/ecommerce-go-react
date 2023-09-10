package repository

import (
	"regexp"
	"strconv"
	"strings"

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
	ts_rank_cd(search,websearch_to_tsquery('english',$1)) AS rank FROM tbl_product p 
	LEFT JOIN tbl_category AS cat ON p.category_id=cat.id LEFT JOIN tbl_product_image im ON im.product_id=p.id 
	AND im.primary_img=true WHERE search @@ websearch_to_tsquery('english',$1) ORDER BY rank DESC LIMIT $2`
	err=globals.DB.Select(&products,query,keyword,pagination.Limit)
	return
}

func (p *productRepository) Find(conditions goqu.Ex,pagination *helpers.PaginationOptions,cols... interface{}) (products []models.ProductFind,err error){
	query:= globals.Dialect.Select("pr.id","pr.name","pr.price","pr.sku","img.img_name").From(goqu.T("tbl_product").As("pr")).
	LeftJoin(goqu.T("tbl_product_image").As("img"),goqu.On(goqu.Ex{"img.product_id":goqu.I("pr.id"),"img.primary_img":true})).
	Limit(pagination.Limit)
	if pagination.Order=="desc"{
		conditions["pr.id"] = goqu.Op{"lt":pagination.Cursor}
		query = query.Order(goqu.C("id").Desc())
	}else{
		conditions["pr.id"] = goqu.Op{"gt":pagination.Cursor}
		query = query.Order(goqu.C("id").Asc())
	}
	query = query.Where(conditions)
	sql,_,_:=query.ToSQL()
	err=globals.DB.Select(&products,sql)
	return
}

func (p *productRepository) FindOne(identifier string)(product models.Product,err error) {
	err = globals.DB.Get(&product,`SELECT pr.id,pr.name,pr.price,pr.description,pr.stock,pr.sku
	,pr.created_at,cat.id AS "cat.id",cat.name AS "cat.name",img.imgs,attrs.attrs
	FROM tbl_product pr
	LEFT JOIN tbl_category cat ON cat.id=pr.category_id
	LEFT JOIN LATERAL(
		SELECT product_id,ARRAY_AGG((id,img_name,primary_img)) AS imgs
		FROM tbl_product_image img
		WHERE img.product_id = pr.id
		GROUP BY 1
	)img ON true
	LEFT JOIN LATERAL(
		SELECT product_id,ARRAY_AGG((attr.id,attr_val.id,attr.name,attr_val.value)) AS attrs 
		FROM tbl_product_attribute pa 
		JOIN tbl_attribute attr ON attr.id=pa.attribute_id 
		JOIN tbl_attribute_value attr_val ON pa.value_id=attr_val.id  
		WHERE product_id=pr.id
		GROUP BY 1
	)attrs ON true
	WHERE (pr.id=$1 OR pr.sku=CAST($1 AS VARCHAR)) AND deleted_at IS NULL`,identifier)
	if err!=nil{
		return product,err
	}
	pattren :=`\((.*?)\)`
	re:=regexp.MustCompile(pattren)
	imgs_matches := re.FindAllStringSubmatch(*product.Imgs,-1)
	for _,match := range imgs_matches{
		fields := strings.Split(match[1], ",")
		id,_ := strconv.Atoi(fields[0])
		item := models.ProductImage{Id:id,Name:fields[1],IsPrimary:fields[2]=="t" };
		product.Images = append(product.Images,item)
	}
	attrs_matches := re.FindAllStringSubmatch(*product.Attrs,-1)
	for _,match := range attrs_matches{
		fields := strings.Split(match[1], ",")
		attrId,_ := strconv.Atoi(fields[0])
		valId,_ := strconv.Atoi(fields[1])
		item := models.ProductAttributes{AttributeId: attrId,ValueId: valId,Name: strings.Trim(fields[2],`\"`),Value:strings.Trim(fields[3],`\"`)};
		product.Attributes = append(product.Attributes,item)
	}
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
	attrs:=make([]goqu.Record,0,len(attributes))
	for _,attr:= range attributes{
		attrs = append(attrs, goqu.Record{"product_id": Id,"value_id": attr.ValueId,"attribute_id":attr.AttributeId})
	}
	sql,_,_ = globals.Dialect.Insert("tbl_product_attribute").Rows(attrs).ToSQL()
	_,err=tx.Exec(sql)
	if err!=nil{
		tx.Rollback()
		return 0,err
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
	sql,_,_:=globals.Dialect.Update("tbl_product").Where(goqu.C("id").Eq(id)).Where(goqu.C("deleted_at").Eq(nil)).Set(helpers.FlattenStruct(data)).ToSQL()
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
