package main

import (
	"github.com/Mohammed785/ecommerce/initializers"
	"github.com/gin-gonic/gin"
)


func init(){
	initializers.InitDB()
}

func main(){
	server := gin.Default()
	server.GET("/",func(ctx *gin.Context) {
		ctx.JSON(200,gin.H{})
	})
	server.Run();
}