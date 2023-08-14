package main

import (
	"log"
	"time"

	"github.com/Mohammed785/ecommerce/initializers"
	"github.com/Mohammed785/ecommerce/routes"
	"github.com/gin-contrib/cors"
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
	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"POST","PUT","GET","DELETE"},
		AllowHeaders: []string{"Origin","Content-type","Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "Cache-Control", "X-Requested-With"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12*time.Hour,
	}))
	server.GET("/",func(ctx *gin.Context) {
		ctx.JSON(200,gin.H{})
	})
	authRouter := server.Group("/api/v1/auth");
	userRouter := server.Group("/api/v1/user");
	routes.SetupAuthRoute(authRouter)
	routes.SetupUserRoute(userRouter)
	server.Run();
}