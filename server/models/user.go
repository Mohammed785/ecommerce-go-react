package models

import "time"


type User struct{
	ID int `db:"id"`
	FirstName string `db:"first_name"`
    LastName  string `db:"last_name"`
	Email string `db:"email"`
	Password string `db:"password" json:"-"`
	Dob string `db:"dob"`
	IsAdmin bool `db:"is_admin"`
	CreatedAt *time.Time `db:"created_at"`
	DeletedAt *time.Time `db:"deleted_at"`
}
