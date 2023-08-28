package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/models"
)


type categoryRepository struct{}

var CategoryRepository *categoryRepository = &categoryRepository{}

func (c *categoryRepository) Find()(categories []models.Category,err error){
	err = globals.DB.Select(&categories,"SELECT id,name FROM tbl_category")
	return categories,err
}

func (c *categoryRepository) GetCategoryAttributes(categoryId string)(attributes []models.Attribute,err error){
	err= globals.DB.Select(&attributes,`SELECT attr.id,attr.name,attr.attribute_type FROM tbl_category_attribute cat_attr 
	JOIN tbl_attribute attr ON attr.id=cat_attr.attribute_id WHERE category_id=$1`,categoryId)
	return
}

func (c *categoryRepository) Create(name string)error{
	_,err:=globals.DB.Exec("INSERT INTO tbl_category(name) VALUES($1)",name)
	return err
}
func (c *categoryRepository) Update(id string,NewName string)(int64,error){
	result,err:=globals.DB.Exec("UPDATE tbl_category SET name = $2 WHERE id=$1",id,NewName)
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