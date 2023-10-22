package middleware

import (
	"net/http"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/gin-gonic/gin"
)

func AdminMiddleware(ctx *gin.Context){
	is_admin := ctx.GetBool("is_admin")
	if !is_admin{
		ctx.AbortWithStatusJSON(http.StatusForbidden,gin.H{"message":"only admins can use this function","code":helpers.FORBIDDEN})
		return
	}
	ctx.Next()
}