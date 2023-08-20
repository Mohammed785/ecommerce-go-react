package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/gin-gonic/gin"
)


func SetupCategoryRoute(route *gin.RouterGroup) {
	route.GET("/",controllers.CategoryController.Find)
	route.POST("/",controllers.CategoryController.Create)
	route.PUT("/:id",controllers.CategoryController.Update)
	route.DELETE("/:id",controllers.CategoryController.Delete)
}