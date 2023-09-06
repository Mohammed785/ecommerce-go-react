package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
)


type categoryRepository struct{}

var CategoryRepository *categoryRepository = &categoryRepository{}


func (c *categoryRepository) List()(categories []models.Category,err error){
	err = globals.DB.Select(&categories,"SELECT id,name,parent_id FROM tbl_category")
	return categories,err
}

func (c *categoryRepository) ListWithSubs()(categories []models.Category,err error){
	err = globals.DB.Select(&categories,`SELECT cat.id,cat.name,ARRAY_AGG((sub.id,sub.name))::text[] subs 
	FROM tbl_category cat LEFT JOIN tbl_category sub ON sub.parent_id=cat.id 
	WHERE cat.parent_id IS NULL GROUP BY cat.id,cat.name ORDER BY cat.id`)
	return categories,err
}


func (c *categoryRepository) GetCategoryAttributes(categoryId string)(attributes []models.Attribute,err error){
	err= globals.DB.Select(&attributes,`SELECT attr.id,attr.name,attr.attribute_type FROM tbl_category_attribute cat_attr 
	JOIN tbl_attribute attr ON attr.id=cat_attr.attribute_id WHERE category_id=$1`,categoryId)
	return
}

func (c *categoryRepository) Create(name string,parent_id *int)error{
	_,err:=globals.DB.Exec("INSERT INTO tbl_category(name,parent_id) VALUES($1,$2)",name,parent_id)
	return err
}
func (c *categoryRepository) Update(id string,data interface{})(int64, error){
	sql,_,_ := globals.Dialect.Update("tbl_category").Set(helpers.FlattenStruct(data)).Where(goqu.C("id").Eq(id)).ToSQL()
	result,err:=globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	rows,err:=result.RowsAffected()
	return rows,err
}

func (c *categoryRepository) Delete(id string)(int64,error){
	result,err:=globals.DB.Exec("DELETE FROM tbl_category WHERE id=$1",id)
	if err!=nil{
		return 0,err
	}
	rows,err:=result.RowsAffected()
	return rows,err
}
