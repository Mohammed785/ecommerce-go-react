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
	CreatedAt *time.Time `json:"createdAt" db:"created_at"`
	Author struct{
		Id int `json:"id" db:"id"`
		FirstName string `json:"firstName" db:"firstName"`
		LastName string `json:"lastName" db:"lastName"`
	} `json:"author" db:"author"`
}

func (r *reviewRepository) Find(productId string,pagination *helpers.PaginationOptions)(reviews []review,err error){
	query:=`SELECT r.rate,r.comment,r.created_at,r.user_id as "author.id",author.first_name AS "author.firstName",author.last_name AS "author.lastName" FROM tbl_review AS r LEFT JOIN tbl_user AS author ON author.id=r.user_id WHERE r.product_id=$1`
	if pagination.Order=="desc"{
		query+=` AND user_id < $2 ORDER BY user_id DESC`
	}else{
		query+=` AND user_id > $2 ORDER BY user_id ASC`
	}
	query+= ` LIMIT $3`
	err=globals.DB.Select(&reviews,query,productId,pagination.Cursor,pagination.Limit)
	return
}

func (r *reviewRepository) FindOne(productId string,userId int)(rev review,err error){
	err= globals.DB.Get(&rev,`SELECT rate,comment,created_at FROM tbl_review WHERE user_id=$1 AND product_id=$2`,userId,productId)
	return
}

type reviewDetails struct{
	Five int `json:"five" db:"five"`
	Four int `json:"four" db:"four"`
	Three int `json:"three" db:"three"`
	Two int `json:"two" db:"two"`
	One int `json:"one" db:"one"`
	Total int `json:"total" db:"total"`
	Avg *float64 `json:"avg" db:"average"`
}

func (r *reviewRepository) Details(productId string)(details reviewDetails,err error){
	query := `
		SELECT COUNT(CASE WHEN rate=5 THEN 1 END) AS five,COUNT(CASE WHEN rate=4 THEN 1 END) AS four,COUNT(CASE WHEN rate=3 THEN 1 END) AS three,
		COUNT(CASE WHEN rate=2 THEN 1 END) AS two,COUNT(CASE WHEN rate=1 THEN 1 END) AS one,COUNT(rate) AS total,ROUND(AVG(rate),1) AS average
		FROM tbl_review
		WHERE product_id= $1
	`
	err = globals.DB.Get(&details,query,productId)
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