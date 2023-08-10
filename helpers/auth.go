package helpers

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)



type authHelpers struct{}

var AuthHelpers *authHelpers = &authHelpers{}



func (a *authHelpers) GenerateToken(userId int,is_admin bool) (token string,err error){
	SECRET_KEY := os.Getenv("JWT_SECRET");
	TOKEN_LIFE_SPAN,err := strconv.Atoi(os.Getenv("TOKEN_LIFE_SPAN"));
	if err!=nil{
		log.Println("no token lifespan provided, will use the default")
		TOKEN_LIFE_SPAN = 12
	}
	claims := jwt.MapClaims{
		"ID":userId,
		"IsAdmin":is_admin,
		"exp":time.Now().Add(time.Hour*time.Duration(TOKEN_LIFE_SPAN)).Unix(),
	}
	token,err=jwt.NewWithClaims(jwt.SigningMethodHS256,claims).SignedString([]byte(SECRET_KEY))
	return 
}