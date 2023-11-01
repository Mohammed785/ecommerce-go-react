package routes

import (
	"github.com/Mohammed785/ecommerce/controllers"
	"github.com/Mohammed785/ecommerce/middleware"
	"github.com/gin-gonic/gin"
)


func SetupProductRoute(router *gin.RouterGroup){
	router.GET("/",controllers.ProductController.Find)
	router.GET("/search",controllers.ProductController.Search)
	router.GET("/:id",controllers.ProductController.FindOne)
	router.POST("/",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.ProductController.Create)
	router.PUT("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.ProductController.Update)
	router.DELETE("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.ProductController.Delete)
	router.POST("/:id/attributes",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.ProductController.AddProductAttributes)
	router.DELETE("/:id/attributes",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.ProductController.DeleteProductAttribute)

	imagesGroup := router.Group("/images",middleware.AuthMiddleware,middleware.AdminMiddleware)
	imagesGroup.POST("/:productId",controllers.ProductController.AddImages)
	imagesGroup.PUT("/:productId/image/:imageId",controllers.ProductController.UpdateImage)
	imagesGroup.DELETE("/:productId",controllers.ProductController.DeleteImages)

	attributesGroup := router.Group("/attribute")
	attributesGroup.GET("",controllers.AttributeController.FindAll)
	attributesGroup.POST("/:id/category",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.AddToCategory)
	attributesGroup.POST("/:id/values",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.AddValues)
	attributesGroup.POST("",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.Create)
	attributesGroup.DELETE("/values",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.DeleteValues)
	attributesGroup.PUT("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.Update)
	attributesGroup.DELETE("/:id",middleware.AuthMiddleware,middleware.AdminMiddleware,controllers.AttributeController.Delete)

	reviewRouter := router.Group("/review");
	reviewRouter.GET("/:productId/details",controllers.ReviewController.ReviewsDetails)
	reviewRouter.GET("/:productId",controllers.ReviewController.Find)
	reviewRouter.POST("/:productId",controllers.ReviewController.Create)
	reviewRouter.PUT("/:productId",controllers.ReviewController.Update)
	reviewRouter.DELETE("/:productId",controllers.ReviewController.Delete)
}