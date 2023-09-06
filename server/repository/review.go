package repository

import (
	"time"

	"github.com/Mohammed785/ecommerce/globals"
	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/doug-martin/goqu/v9"
)


type reviewRepository struct{}

var ReviewRepository *reviewRepository = &reviewRepository{}
type review struct{
	Rate int `json:"rate" db:"rate"`
	Comment *string `json:"comment" db:"comment"`
	CreatedAt *time.Time `json:"created_at" db:"created_at"`
	UserId int `json:"user_id" db:"user_id"`
	Name string `json:"name" db:"name"`
}

func (r *reviewRepository) Find(productId string,pagination *helpers.PaginationOptions)(reviews []review,err error){
	query:=`SELECT r.rate,r.comment,r.created_at,r.user_id,CONCAT(u.first_name,' ',u.last_name) AS name FROM tbl_review AS r LEFT JOIN tbl_user AS u ON u.id=r.user_id WHERE r.product_id=$1`
	if pagination.OrderBy=="desc"{
		query+=` AND id < $2 ORDER BY ID DESC`
	}else{
		query+=` AND id > $2 ORDER BY ID ASC`
	}
	query+= ` LIMIT $3`
	err=globals.DB.Select(&reviews,query,productId,pagination.Cursor,pagination.Limit)
	return
}

func (r *reviewRepository) Create(userId int,productId string,rate int,comment *string)error{
	_,err := globals.DB.Exec("INSERT INTO tbl_review(rate,comment,product_id,user_id) VALUES($1,$2,$3,$4)",rate,comment,productId,userId)
	return err
}

func (r *reviewRepository) Update(productId string,userId int,data interface{})(int64,error){
	sql,_,_ := globals.Dialect.Update("tbl_review").Where(goqu.Ex{"user_id":userId,"product_id":productId}).Set(helpers.FlattenStruct(data)).ToSQL()
	res,err:=globals.DB.Exec(sql)
	if err!=nil{
		return 0,err
	}
	rows,err:= res.RowsAffected()
	return rows,err
}

func (r *reviewRepository) Delete(productId string,userId int)(int64,error){
	res,err:=globals.DB.Exec("DELETE FROM tbl_review WHERE user_id=$1 AND product_id=$2",userId,productId)
	if err!=nil{
		return 0,err
	}
	rows,err:= res.RowsAffected()
	return rows,err
}