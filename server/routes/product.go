package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/gin-gonic/gin"
)


func SetupProductRoute(router *gin.RouterGroup){
	router.GET("/:id",controllers.ProductController.FindOne)
	router.POST("/",controllers.ProductController.Create)
	router.PUT("/:id",controllers.ProductController.Update)
	router.DELETE("/:id",controllers.ProductController.Delete)
	router.POST("/:id/attributes",controllers.ProductController.AddProductAttributes)
	router.DELETE("/:id/attributes",controllers.ProductController.DeleteProductAttribute)
	attributesGroup := router.Group("/attribute")
	attributesGroup.GET("",controllers.AttributeController.FindAll)
	attributesGroup.POST("",controllers.AttributeController.Create)
	attributesGroup.PUT("/:id",controllers.AttributeController.Update)
	attributesGroup.DELETE("/:id",controllers.AttributeController.Delete)
	
}