package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/gin-gonic/gin"
)


func SetupProductRoute(router *gin.RouterGroup){
	router.GET("/",controllers.ProductController.Find)
	router.GET("/search",controllers.ProductController.Search)
	router.GET("/:id",controllers.ProductController.FindOne)
	router.POST("/",controllers.ProductController.Create)
	router.PUT("/:id",controllers.ProductController.Update)
	router.DELETE("/:id",controllers.ProductController.Delete)
	router.POST("/:id/attributes",controllers.ProductController.AddProductAttributes)
	router.DELETE("/:id/attributes",controllers.ProductController.DeleteProductAttribute)
	imagesGroup := router.Group("/images")
	imagesGroup.POST("/:productId",controllers.ProductController.AddImages)
	imagesGroup.PUT("/:productId/image/:imageId",controllers.ProductController.UpdateImage)
	imagesGroup.DELETE("/",controllers.ProductController.DeleteImages)

	attributesGroup := router.Group("/attribute")
	attributesGroup.GET("",controllers.AttributeController.FindAll)
	attributesGroup.POST("/:id/category",controllers.AttributeController.AddToCategory)
	attributesGroup.POST("",controllers.AttributeController.Create)
	attributesGroup.PUT("/:id",controllers.AttributeController.Update)
	attributesGroup.DELETE("/:id",controllers.AttributeController.Delete)

	reviewRouter := router.Group("/review");
	reviewRouter.GET("/:productId",controllers.ReviewController.Find)
	reviewRouter.POST("/:productId",controllers.ReviewController.Create)
	reviewRouter.PUT("/:productId",controllers.ReviewController.Update)
	reviewRouter.DELETE("/:productId",controllers.ReviewController.Delete)
}