package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/gin-gonic/gin"
)

func SetupUserRoute(group *gin.RouterGroup){
	group.GET("/me",controllers.UserController.Me)
}