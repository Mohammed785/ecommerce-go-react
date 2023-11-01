package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/Mohammed785/ecommerce/middleware"
	"github.com/gin-gonic/gin"
)


func SetupCategoryRoute(route *gin.RouterGroup) {
	route.GET("/:id/attributes",controllers.CategoryController.ListAttributes)
	route.GET("/:id",controllers.CategoryController.Find)
	route.GET("/",controllers.CategoryController.List)
	route.POST("/",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.CategoryController.Create)
	route.PUT("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.CategoryController.Update)
	route.DELETE("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.CategoryController.Delete)
}