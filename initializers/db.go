package initializers

import (
	"log"
	_ "github.com/lib/pq"
	"github.com/jmoiron/sqlx"
)


var DB *sqlx.DB


func InitDB(){
	var err error
	DB,err = sqlx.Open("postgres","user=mohammed dbname=ecommerce");
	if err!=nil{
		log.Fatalln(err)
	}	
}