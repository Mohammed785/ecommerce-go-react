package main

import (
	"log"
	"time"

	"github.com/Mohammed785/ecommerce/initializers"
	"github.com/Mohammed785/ecommerce/middleware"
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
	server.MaxMultipartMemory = 4<<20
	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"POST","PUT","GET","DELETE"},
		AllowHeaders: []string{"Origin","Content-type","Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "Accept", "Cache-Control", "X-Requested-With"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge: 12*time.Hour,
	}))
	server.Static("/static","./uploads")
	authRouter := server.Group("/api/v1/auth");
	userRouter := server.Group("/api/v1/user",middleware.AuthMiddleware);
	categoryRouter := server.Group("/api/v1/category",middleware.AuthMiddleware);
	productRouter := server.Group("/api/v1/product",middleware.AuthMiddleware);
	routes.SetupAuthRoute(authRouter)
	routes.SetupUserRoute(userRouter)
	routes.SetupCategoryRoute(categoryRouter)
	routes.SetupProductRoute(productRouter)
	server.Run();
}