package controllers

import (
	"net/http"
	"strconv"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)




type attributesCreate struct{
	Attributes []repository.AttributeCreate `json:"attributes" binding:"required,min=1,unique=Name,dive"`
}


type attributeController struct{}
var AttributeController *attributeController = &attributeController{}

func (a *attributeController) FindAll(ctx *gin.Context){
	_,withCategory := ctx.GetQuery("category")
	_,withValues := ctx.GetQuery("values")
	attributes,err:=repository.AttributeRepository.FindAll(withCategory,withValues);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	ctx.JSON(http.StatusOK,gin.H{"attributes":attributes})
}

func (a *attributeController) Create(ctx *gin.Context){
	var data attributesCreate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}

	ids,err:=repository.AttributeRepository.CreateBulk(data.Attributes...)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK,gin.H{"attributes":ids})
}

func (a *attributeController) AddValues(ctx *gin.Context){
	attributeId:=ctx.Param("id")
	var data struct{
		Values []string `json:"values" binding:"required,min=1,unique"`
	}
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	err:=repository.AttributeRepository.AddValues(attributeId,data.Values);
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (a *attributeController) DeleteValues(ctx *gin.Context){
	var data struct{
		Values []int `json:"values" binding:"required,min=1,unique"`
	}
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	err:=repository.AttributeRepository.DeleteValues(data.Values);
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (a *attributeController) AddToCategory(ctx *gin.Context){
	id,err:=strconv.Atoi(ctx.Param("id"))
	if err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"invalid attribute id","code":helpers.WRONG_PRAM})
		return 
	}
	var data struct{
		Ids []int `json:"ids" binding:"required,dive,min=1"`
	}
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	err=repository.AttributeRepository.AddToCategory(id,data.Ids)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (a *attributeController) Update(ctx *gin.Context){
	var data repository.AttributeUpdate
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	id:=ctx.Param("id")
	rows,err:=repository.AttributeRepository.Update(id,&data)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if rows==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"attribute not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (a *attributeController) Delete(ctx *gin.Context){
	id:=ctx.Param("id")
	rows,err:=repository.AttributeRepository.Delete(id);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	if rows==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"attribute not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusNoContent)
}

