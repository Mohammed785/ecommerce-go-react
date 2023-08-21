package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
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

func (a *attributeRepository) CreateBulk(attributes ...interface{}) (int64,error){
	sql,_,_ := globals.Dialect.Insert("tbl_attribute").Rows(attributes).ToSQL()
	result,err:=globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	inserted,err := result.RowsAffected()
	return inserted,err
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