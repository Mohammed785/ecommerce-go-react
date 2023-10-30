package repository

import (
	"strconv"
	"strings"

	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

type attributeRepository struct {}
var AttributeRepository *attributeRepository = &attributeRepository{}

func (a *attributeRepository) FindAll(withCategories ,withValues bool)(attributes []models.Attribute,err error){
	query:=goqu.From(goqu.T("tbl_attribute").As("attr")).Select("attr.id","attr.name")
	if withCategories{
		categoryQuery := goqu.From(goqu.T("tbl_category_attribute").As("ca")).
		Select("attribute_id",goqu.L("ARRAY_REMOVE(ARRAY_AGG((cat.id,cat.name)),NULL)").As("categories")).LeftJoin(goqu.T("tbl_category").As("cat"),
		goqu.On(goqu.I("ca.category_id").Eq(goqu.I("cat.id")))).Where(goqu.C("attribute_id").Eq(goqu.I("attr.id"))).GroupBy("attribute_id").As("categories")
		query = query.LeftJoin(
			goqu.Lateral(categoryQuery),goqu.On(goqu.V(true)),
		).SelectAppend("categories.categories")
	}
	if withValues{
		valuesQuery := goqu.From(goqu.T("tbl_attribute_value")).
		Select("attribute_id",goqu.L("ARRAY_REMOVE(ARRAY_AGG((id,value)),NULL)").As("values")).
		Where(goqu.C("attribute_id").Eq(goqu.I("attr.id"))).GroupBy("attribute_id").As("val")
		query = query.LeftJoin(
			goqu.Lateral(valuesQuery),goqu.On(goqu.V(true)),
		).SelectAppend("val.values")

	}
	sql,_,_:=query.ToSQL()
	err = globals.DB.Select(&attributes,sql)
	for i:=range attributes{
		attributes[i].Categories = make([]models.Category, 0,len(attributes[i].Cat))
		attributes[i].Values = make([]models.AttributeValue, 0,len(attributes[i].Cat))
		for _,category := range attributes[i].Cat{
			info := strings.Split(strings.Trim(category,"()"),",")
			id,_:=strconv.Atoi(info[0])
			attributes[i].Categories = append(attributes[i].Categories, models.Category{Id: id,Name:info[1]})
		}
		for _,value := range attributes[i].ValuesString{
			info := strings.Split(strings.Trim(value,"()"),",")
			id,_:=strconv.Atoi(info[0])
			attributes[i].Values = append(attributes[i].Values, models.AttributeValue{Id: id,Value: info[1]})
		}
	}

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
	Id int `json:"id"`
	Name string `json:"name"`
	Values []attributeValue `json:"values"`
}

func (a *attributeRepository) ListCategoryAttributes(categoryId string) (map[int]attributesWithValues, error){
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
			attributes[attr.AttributeId] = attributesWithValues{Id:attr.AttributeId,Name: attr.AttributeName,Values: []attributeValue{{Id: attr.AttributeValueId,Value: attr.AttributeValue}}}
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
	CategoriesIds []int `json:"categoriesIds" db:"-" binding:"omitempty,min=1,unique"`
}

type CategoryAttribute struct{
	AttributeId int `json:"attributeId" db:"attribute_id" binding:"required,min=1"`
	CategoryId int `json:"categoryId" db:"category_id" binding:"required,min=1"`	
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

type AttributeUpdate struct{
	Name *string `json:"name" binding:"omitempty,max=255"`
	Values struct{
		ToDelete []int `json:"toDelete" binding:"omitempty"`
		ToAdd []string `json:"toAdd" binding:"omitempty"`
		} `json:"values" binding:"omitempty,dive" db:"-"`
	Categories struct{
		ToDelete []int `json:"toDelete" binding:"omitempty"`
		ToAdd []int `json:"toAdd" binding:"omitempty"`	
	} `json:"categories" binding:"omitempty,dive" db:"-"`
}

func (a *attributeRepository) Update(id string,newData *AttributeUpdate)(inserted int64,err error){
	if newData.Values.ToDelete!=nil{
		query,args,err := sqlx.In("DELETE FROM tbl_attribute_value WHERE id IN (?)",newData.Values.ToDelete);
		if err!=nil{
			return 0,err
		}
		query = globals.DB.Rebind(query)
		_,err=globals.DB.Exec(query,args...);
		if err!=nil{
			return 0,err
		}
	}
	if newData.Values.ToAdd!=nil{
		rows:= helpers.Map[string,struct{Value string `db:"value"`;AttributeId string `db:"attribute_id"`}](newData.Values.ToAdd,func(s string) struct{Value string "db:\"value\""; AttributeId string "db:\"attribute_id\""} {
			return struct{Value string "db:\"value\""; AttributeId string "db:\"attribute_id\""}{Value: s,AttributeId: id}
		})
		query,_,_ := globals.Dialect.Insert("tbl_attribute_value").Rows(rows).ToSQL();
		_,err=globals.DB.Exec(query);
		if err!=nil{
			return 0,err
		}
	}
	if newData.Categories.ToDelete!=nil{
		query,args,err := sqlx.In("DELETE FROM tbl_category_attribute WHERE category_id IN (?) AND attribute_id=?",newData.Categories.ToDelete,id);
		if err!=nil{
			return 0,err
		}
		query = globals.DB.Rebind(query)
		_,err=globals.DB.Exec(query,args...);
		if err!=nil{
			return 0,err
		}
	}
	if newData.Categories.ToAdd!=nil{
		rows:= helpers.Map[int,struct{CategoryId int `db:"category_id"`;AttributeId string `db:"attribute_id"`}](newData.Categories.ToAdd,func(s int) struct{CategoryId int "db:\"category_id\""; AttributeId string "db:\"attribute_id\""} {
			return struct{CategoryId int "db:\"category_id\""; AttributeId string "db:\"attribute_id\""}{CategoryId: s,AttributeId: id}
		})
		query,_,_ := globals.Dialect.Insert("tbl_category_attribute").Rows(rows).ToSQL();
		_,err=globals.DB.Exec(query);
		if err!=nil{
			return 0,err
		}
	}
	if newData.Name!=nil{
		result,err:= globals.DB.Exec("UPDATE tbl_attribute SET name=$1 WHERE id=$2",newData.Name,id)
		if err!=nil{
			return 0,err
		}
		inserted,err = result.RowsAffected()
	}
	return
	// sql,_,_ := globals.Dialect.Update("tbl_attribute").Where(goqu.C("id").Eq(id)).Set(helpers.FlattenStruct(newData)).ToSQL()
}

func (a *attributeRepository) Delete(id string)(int64,error){
	result,err:= globals.DB.Exec("DELETE FROM tbl_attribute WHERE id = $1",id)
	if err!=nil{
		return 0,err
	}
	inserted,err := result.RowsAffected()
	return inserted,err
}