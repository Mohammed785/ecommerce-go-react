package main

import (
	"log"

	"github.com/Mohammed785/ecommerce/initializers"
	"github.com/Mohammed785/ecommerce/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func init(){
	if err:=godotenv.Load();err!=nil{
		log.Fatalln("Error loading .env file");
	}
	initializers.InitDB()
}

func main(){
	server := gin.Default()
	server.GET("/",func(ctx *gin.Context) {
		ctx.JSON(200,gin.H{})
	})
	authRouter := server.Group("/api/v1/auth");
	routes.SetupUserRoute(authRouter)
	server.Run();
}