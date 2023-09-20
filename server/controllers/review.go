package controllers

import (
	"net/http"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)


type reviewCreate struct{
	Comment *string `json:"comment" binding:"omitempty"`
	Rate int `json:"rate" binding:"required,min=1,max=5"`
}

type reviewUpdate struct{
	Comment *string `json:"comment" binding:"omitempty"`
	Rate *int `json:"rate" binding:"omitempty,min=1,max=5"`
}


type reviewController struct{}

var ReviewController *reviewController = &reviewController{}

func (r *reviewController) Find(ctx *gin.Context){
	productId:=ctx.Param("productId")
	pagination := helpers.NewPaginationOptions(ctx.Query("cursor"),ctx.Query("limit"),ctx.Query("orderBy"))
	reviews,err := repository.ReviewRepository.Find(productId,&pagination)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"review"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK,gin.H{"reviews":reviews})
}

func (r *reviewController) Create(ctx *gin.Context){
	var data reviewCreate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	userId := ctx.GetFloat64("uid")
	productId := ctx.Param("productId")
	err:=repository.ReviewRepository.Create(int(userId),productId,data.Rate,data.Comment)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"review"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (r *reviewController) Update(ctx *gin.Context){
	var data reviewUpdate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	userId := ctx.GetFloat64("uid")
	productId := ctx.Param("productId")
	affected,err:=repository.ReviewRepository.Update(productId,int(userId),&data);
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"review"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if affected==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"review not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (r *reviewController) Delete(ctx *gin.Context){
	userId := ctx.GetFloat64("uid")
	productId := ctx.Param("productId")
	affected,err:=repository.ReviewRepository.Delete(productId,int(userId))
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"review"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if affected==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"review not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusNoContent)
}
