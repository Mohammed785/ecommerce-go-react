package repository

import (
	"fmt"

	"github.com/Mohammed785/ecommerce/models"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
	"github.com/doug-martin/goqu/v9"
)


type userRepositoryStruct struct{
	db *sqlx.DB
	dialect *goqu.DialectWrapper
}

var UserRepository *userRepositoryStruct;

func InitUser(db *sqlx.DB,dialect *goqu.DialectWrapper){
	UserRepository = &userRepositoryStruct{db: db,dialect: dialect}
}

func (u *userRepositoryStruct) FindById(id string,cols interface{})(models.User,error){
	var user models.User
	sql,_,_ := u.dialect.From("tbl_user").Select(cols).Where(goqu.C("id").Eq(id)).ToSQL()
	err:= u.db.QueryRowx(sql).StructScan(&user)
	return user,err
}

func (u *userRepositoryStruct) FindByEmail(email string,cols interface{})(models.User,error){
	user:= models.User{};
	sql,_,_ := u.dialect.From("tbl_user").Select(cols).Where(goqu.C("email").Eq(email)).ToSQL()
	err:= u.db.Get(&user,sql)
	fmt.Println(user);
	return user,err
}

func (u *userRepositoryStruct) FindBy(cols interface{},conditions goqu.Expression)(users []models.User,err error){
	sql,_,_ := u.dialect.From("tbl_user").Select(cols).Where(conditions).ToSQL()
	err = u.db.Select(&users,sql)
	return
}

func (u *userRepositoryStruct) Create(data *models.User)(int64,error){
	hash,err := bcrypt.GenerateFromPassword([]byte(data.Password),bcrypt.DefaultCost);
	if err!=nil{
		return 0,err
	}
	data.Password = string(hash);
	sql,_,_:=u.dialect.Insert("tbl_user").Rows(data).ToSQL()
	res,err:=u.db.Exec(sql);
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}

func (u *userRepositoryStruct) Update(conditions goqu.Expression,data interface{})(int64,error){
	sql,_,_:= u.dialect.Update("tbl_user").Where(conditions).Set(data).ToSQL()
	res,err:=u.db.Exec(sql)
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}

func (u *userRepositoryStruct) Delete(conditions goqu.Expression,soft bool)(int64,error){
	var sql string
	if soft{
		sql,_,_ = u.dialect.Update("tbl_user").Where(conditions).Set(goqu.Record{"deleted_at":"now()"}).ToSQL()
	}else{
		sql,_,_ = u.dialect.Delete("tbl_user").Where(conditions).ToSQL()
	}
	res,err:=u.db.Exec(sql);
	if err!=nil{
		return 0,err
	}
	rows,err:=res.RowsAffected();
	return rows,err
}
