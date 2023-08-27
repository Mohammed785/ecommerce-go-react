package controllers

import (
	"net/http"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)

type categoryController struct{}

var CategoryController *categoryController = &categoryController{}

type categoryCreate struct{
	Name string `json:"name" binding:"required,max=255"`
}

func (c *categoryController) Find(ctx *gin.Context){
	categories,err := repository.CategoryRepository.Find()
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return 
	}
	ctx.JSON(http.StatusOK,gin.H{"categories":categories})
}
func (c *categoryController) Create(ctx *gin.Context){
	var data categoryCreate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	err:=repository.CategoryRepository.Create(data.Name)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"category"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusAccepted)
}
func (c *categoryController) Update(ctx *gin.Context){
	id:=ctx.Param("id")
	var data categoryCreate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	rows,err:=repository.CategoryRepository.Update(id,data.Name)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"category"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if rows==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"category not found","code":helpers.RECORD_NOT_FOUND})
		return	
	}
	ctx.Status(http.StatusOK)
}
func (c *categoryController) Delete(ctx *gin.Context){
	id:=ctx.Param("id")
	rows,err:=repository.CategoryRepository.Delete(id)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"category"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if rows==0{
		ctx.Status(http.StatusNotFound)
		return	
	}
	ctx.Status(http.StatusOK)

}