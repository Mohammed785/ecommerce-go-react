package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/gin-gonic/gin"
)



func SetupUserRoute(group *gin.RouterGroup){
	group.POST("/login",controllers.AuthController.Login)
	group.POST("/register",controllers.AuthController.Register)
	group.POST("/logout",controllers.AuthController.Logout)
	group.PUT("/change-password",controllers.AuthController.ChangePassword)

}