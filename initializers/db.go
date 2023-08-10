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
var schema = `CREATE TABLE IF NOT EXISTS tbl_user(
		id SERIAL PRIMARY KEY,
		first_name VARCHAR(25) NOT NULL,
		last_name VARCHAR(25) NOT NULL,
		email VARCHAR(120) NOT NULL UNIQUE,
		password VARCHAR(150) NOT NULL,
		dob DATE NOT NULL,
		gender CHAR(1) NOT NULL CHECK(gender IN ('M','F')),
		is_admin BOOLEAN DEFAULT false,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		deleted_at TIMESTAMP DEFAULT NULL
	);
	CREATE INDEX IF NOT EXISTS tbl_user_email_idx ON tbl_user(email);`

func InitDB(){
	var err error
	DB,err = sqlx.Open("pgx",fmt.Sprintf("user=%s dbname=%s password=%s",os.Getenv("DB_USER"),os.Getenv("DB_NAME"),os.Getenv("DB_PASSWORD")));
	if err!=nil{
		log.Fatalln(err);
	}
	Dialect = goqu.Dialect("postgres")
	DB.MustExec(schema)
	repository.InitUser(DB,&Dialect)
}