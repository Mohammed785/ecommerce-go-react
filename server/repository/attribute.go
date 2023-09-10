package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

type attributeRepository struct {}
var AttributeRepository *attributeRepository = &attributeRepository{}

func (a *attributeRepository) FindAll()(attributes []models.Attribute,err error){
	err=globals.DB.Select(&attributes,"SELECT * FROM tbl_attribute")
	return attributes,err
}

type categoryAttribute struct{
	AttributeId int `db:"attributeId"`
	AttributeValueId int `db:"valueId"`
	AttributeName string `db:"name"`
	AttributeValue string `db:"value"`
}

type attributeValue struct{
	Id int `json:"id"`
	Value string `json:"value"`
}

type attributesWithValues struct{
	Name string `json:"name"`
	Values []attributeValue `json:"values"`
}

func (a *attributeRepository) ListCategory(categoryId string,withValues bool) (map[int]attributesWithValues, error){
	attrs := make([]categoryAttribute,0)
	err := globals.DB.Select(&attrs,`SELECT attr.id AS "attributeId",attr_val.id AS "valueId",attr.name,attr_val.value 
		FROM tbl_category_attribute ca 
		JOIN tbl_attribute attr ON attr.id = ca.attribute_id
		JOIN tbl_attribute_value attr_val ON attr_val.attribute_id = ca.attribute_id
		WHERE ca.category_id = $1`,categoryId)
	if err!=nil{
		return nil,err
	}
	attributes := make(map[int]attributesWithValues)
	for _,attr := range attrs{
		if entry,ok:=attributes[attr.AttributeId];ok{
			entry.Values = append(entry.Values, attributeValue{Id: attr.AttributeValueId,Value: attr.AttributeValue})
			attributes[attr.AttributeId] = entry
		}else{
			attributes[attr.AttributeId] = attributesWithValues{Name: attr.AttributeName,Values: []attributeValue{attributeValue{Id: attr.AttributeValueId,Value: attr.AttributeValue}}}
		}
	}
	return attributes,nil
}

func (a *attributeRepository) Create(name,attributeType string) error {
	_,err:=globals.DB.Exec("INSERT INTO tbl_attribute(name) VALUES ($1)",name)
	return err
}
type AttributeCreate struct{
	Name string `json:"name" binding:"required,max=255"`
	Values []string `json:"values" db:"-" binding:"required,min=1,unique"`
	CategoriesIds []int `json:"categories_ids" db:"-" binding:"omitempty,min=1,unique"`
}

type CategoryAttribute struct{
	AttributeId int `json:"attribute_id" db:"attribute_id" binding:"required,min=1"`
	CategoryId int `json:"category_id" db:"category_id" binding:"required,min=1"`	
}

func (a *attributeRepository) CreateBulk(attributes ...AttributeCreate) ([]int,error){
	sql,_,_ := globals.Dialect.Insert("tbl_attribute").Rows(attributes).Returning("id").ToSQL()
	rows,err:=globals.DB.Queryx(sql)
	if err!=nil{
		return nil,err
	}
	defer rows.Close()
	var id int
	attributes_ids := make([]int,0,len(attributes))
	category_attributes:=make([]CategoryAttribute,0,len(attributes));
	attribute_values:=make([]goqu.Record,0,len(attributes));
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
		for _,value:=range attr.Values{
			attribute_values = append(attribute_values, goqu.Record{"attribute_id":id,"value":value})
		}
	}
	sql,_,_=globals.Dialect.Insert("tbl_attribute_value").Rows(attribute_values).ToSQL()
	_,err=globals.DB.Exec(sql)
	if err!=nil{
		return nil,err
	}
	sql,_,_=globals.Dialect.Insert("tbl_category_attribute").Rows(category_attributes).ToSQL()
	_,err=globals.DB.Exec(sql)
	if err!=nil{
		return nil,err
	}
	return attributes_ids,err
}

func (a *attributeRepository) AddValues(attributeId string,values []string) error{
	rows := helpers.Map[string,goqu.Record](values,func(val string) goqu.Record {
		return goqu.Record{"attribute_id": attributeId,"value": val}
	})
	sql,_,_ := globals.Dialect.Insert("tbl_attribute_value").Rows(rows).ToSQL()
	_,err:=globals.DB.Exec(sql)
	return err
}

func (a *attributeRepository) DeleteValues(values []int) error{
	query,args,err:=sqlx.In("DELETE FROM tbl_attribute_value WHERE id IN (?)", values)
	if err!=nil{
		return err
	}
	query=globals.DB.Rebind(query)
	_,err=globals.DB.Exec(query,args...)
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
	sql,_,_ := globals.Dialect.Update("tbl_attribute").Where(goqu.C("id").Eq(id)).Set(helpers.FlattenStruct(values)).ToSQL()
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