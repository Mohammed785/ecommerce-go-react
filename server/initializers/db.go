package initializers

import (
	"fmt"
	"log"
	"os"

	"github.com/Mohammed785/ecommerce/globals"
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)


var DB *sqlx.DB
var Dialect goqu.DialectWrapper

func InitDB(){
	var err error
	globals.DB,err = sqlx.Open("pgx",fmt.Sprintf("user=%s dbname=%s password=%s",os.Getenv("DB_USER"),os.Getenv("DB_NAME"),os.Getenv("DB_PASSWORD")));
	if err!=nil{
		log.Fatalln(err);
	}
	globals.Dialect = goqu.Dialect("postgres")
}