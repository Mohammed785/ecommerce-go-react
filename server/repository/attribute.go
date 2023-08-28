package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
)

type attributeRepository struct {}
var AttributeRepository *attributeRepository = &attributeRepository{}

func (a *attributeRepository) FindAll()(attributes []models.Attribute,err error){
	err=globals.DB.Select(&attributes,"SELECT * FROM tbl_attribute")
	return attributes,err
}

func (a *attributeRepository) FindType(attrType string)(attributes []models.Attribute,err error){
	err=globals.DB.Select(&attributes,"SELECT * FROM tbl_attribute WHERE attribute_type=$1",attrType)
	return attributes,err
}

func (a *attributeRepository) Create(name,attributeType string) error {
	_,err:=globals.DB.Exec("INSERT INTO tbl_attribute(name,attribute_type) VALUES ($1,$2)",name,attributeType)
	return err
}
type AttributeCreate struct{
	Name string `json:"name" binding:"required,max=255"`
	AttributeType string `json:"attribute_type" db:"attribute_type" goqu:"defaultifempty" binding:"omitempty,oneof= text number datetime date time"`
	CategoriesIds []int `json:"categories_ids" db:"-" binding:"omitempty,dive,min=1"` 
}

type CategoryAttribute struct{
	AttributeId int `json:"attribute_id" db:"attribute_id" binding:"required,min=1"`
	CategoryId int `json:"category_id" db:"category_id" binding:"required,min=1"`	
}

func (a *attributeRepository) CreateBulk(attributes ...AttributeCreate) error{
	sql,_,_ := globals.Dialect.Insert("tbl_attribute").Rows(attributes).Returning("id").ToSQL()
	rows,err:=globals.DB.Queryx(sql)
	if err!=nil{
		return err
	}
	defer rows.Close()
	var id int
	attributes_ids := make([]int,0,len(attributes))
	category_attributes:=make([]CategoryAttribute,0,len(attributes));
	for rows.Next(){
		err=rows.Scan(&id)
		if err!=nil{
			continue
		}
		attributes_ids = append(attributes_ids, id)
	}
	for i,attr:=range attributes{
		id = attributes_ids[i]
		for _,category_id := range attr.CategoriesIds{
			category_attributes = append(category_attributes, CategoryAttribute{AttributeId: id,CategoryId: category_id})
		}
	}
	sql,_,_=globals.Dialect.Insert("tbl_category_attribute").Rows(category_attributes).ToSQL()
	_,err=globals.DB.Exec(sql)

	return err
}

func (a *attributeRepository) AddToCategory(attributeId int,categories []int) error{
	rows := helpers.Map[int,CategoryAttribute](categories,func(i int) CategoryAttribute {
		return CategoryAttribute{AttributeId: attributeId,CategoryId: i}
	})
	sql,_,_ := globals.Dialect.Insert("tbl_category_attribute").Rows(rows).ToSQL()
	_,err:=globals.DB.Exec(sql)
	return err
}

func (a *attributeRepository) Update(id string,values interface{})(int64,error){
	sql,_,_ := globals.Dialect.Update("tbl_attribute").Where(goqu.C("id").Eq(id)).Set(values).ToSQL()
	result,err:= globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	inserted,err := result.RowsAffected()
	return inserted,err
}

func (a *attributeRepository) Delete(id string)(int64,error){
	result,err:= globals.DB.Exec("DELETE FROM tbl_attribute WHERE id = $1",id)
	if err!=nil{
		return 0,err
	}
	inserted,err := result.RowsAffected()
	return inserted,err
}