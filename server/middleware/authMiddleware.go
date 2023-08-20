package middleware

import (
	"errors"
	"net/http"
	"os"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)


func AuthMiddleware(ctx *gin.Context){
	tokenString := helpers.AuthHelpers.ExtractToken(ctx)
	if tokenString==""{
		ctx.JSON(http.StatusUnauthorized,gin.H{"message":"Please login and try again"})
		ctx.Abort()
		return
	}
	token,err:=jwt.Parse(tokenString,func(t *jwt.Token) (interface{}, error) {
		if _,ok:=t.Method.(*jwt.SigningMethodHMAC);!ok{
			return nil,errors.New("invalid token please login and try again")
		}
		return []byte(os.Getenv("JWT_SECRET")),nil
	})
	if err!=nil{
		ctx.JSON(http.StatusUnauthorized,gin.H{"message":"Please login and try again"})
		ctx.Abort()
		return
	}
	claims,ok:=token.Claims.(jwt.MapClaims)
	if !ok||!token.Valid{
		ctx.JSON(http.StatusUnauthorized,gin.H{"message":"Please login and try again"})
		ctx.Abort()
		return	
	}
	ctx.Set("uid",claims["uid"])
	ctx.Set("is_admin",claims["is_admin"])
	ctx.Next()
}