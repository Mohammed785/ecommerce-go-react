package initializers

import (
	"fmt"
	"log"
	"os"

	"github.com/Mohammed785/ecommerce/repository"
	"github.com/jmoiron/sqlx"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/doug-martin/goqu/v9"
  	_ "github.com/doug-martin/goqu/v9/dialect/postgres"

)


var DB *sqlx.DB
var Dialect goqu.DialectWrapper

func InitDB(){
	var err error
	DB,err = sqlx.Open("pgx",fmt.Sprintf("user=%s dbname=%s password=%s",os.Getenv("DB_USER"),os.Getenv("DB_NAME"),os.Getenv("DB_PASSWORD")));
	if err!=nil{
		log.Fatalln(err);
	}
	Dialect = goqu.Dialect("postgres")

	repository.InitUser(DB,&Dialect)
}