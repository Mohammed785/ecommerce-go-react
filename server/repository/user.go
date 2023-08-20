package repository

import (
	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/doug-martin/goqu/v9"
)


type userRepositoryStruct struct{}

var UserRepository *userRepositoryStruct = &userRepositoryStruct{};

func (u *userRepositoryStruct) FindById(id int,cols interface{})(models.User,error){
	var user models.User
	sql,_,_ := globals.Dialect.From("tbl_user").Select(cols).Where(goqu.C("id").Eq(id)).Where(goqu.C("deleted_at").Eq(nil)).ToSQL()
	err:= globals.DB.QueryRowx(sql).StructScan(&user)
	return user,err
}

func (u *userRepositoryStruct) FindByEmail(email string,cols interface{})(models.User,error){
	user:= models.User{};
	sql,_,_ := globals.Dialect.From("tbl_user").Select(cols).Where(goqu.C("email").Eq(email)).Where(goqu.C("deleted_at").Eq(nil)).ToSQL()
	err:= globals.DB.Get(&user,sql)
	return user,err
}

func (u *userRepositoryStruct) FindBy(cols interface{},conditions goqu.Expression)(users []models.User,err error){
	sql,_,_ := globals.Dialect.From("tbl_user").Select(cols).Where(conditions).Where(goqu.C("deleted_at").Eq(nil)).ToSQL()
	err = globals.DB.Select(&users,sql)
	return
}

func (u *userRepositoryStruct) Create(data interface{})(int64,error){
	sql,_,_:=globals.Dialect.Insert("tbl_user").Rows(data).ToSQL()
	res,err:=globals.DB.Exec(sql);
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}

func (u *userRepositoryStruct) Update(conditions goqu.Expression,data interface{})(int64,error){
	sql,_,_:= globals.Dialect.Update("tbl_user").Where(conditions).Where(goqu.C("deleted_at").Eq(nil)).Set(data).ToSQL()
	res,err:=globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}

func (u *userRepositoryStruct) Delete(conditions goqu.Expression,soft bool)(int64,error){
	var sql string
	if soft{
		sql,_,_ = globals.Dialect.Update("tbl_user").Where(conditions).Set(goqu.Record{"deleted_at":"now()"}).ToSQL()
	}else{
		sql,_,_ = globals.Dialect.Delete("tbl_user").Where(conditions).ToSQL()
	}
	res,err:=globals.DB.Exec(sql);
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}
