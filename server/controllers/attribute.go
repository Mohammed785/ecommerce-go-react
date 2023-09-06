package controllers

import (
	"net/http"
	"strconv"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)


type attributeUpdate struct{
	Name *string `json:"name" binding:"omitempty,max=255"`
	AttributeType string `json:"attribute_type" db:"attribute_type" goqu:"defaultifempty" binding:"omitempty,oneof= text number datetime date time"`
}

type attributesCreate struct{
	Attributes []repository.AttributeCreate `json:"attributes" binding:"required,min=1,unique=Name,dive"`
}

type productAttribute struct{
	ProductId int `json:"-" db:"product_id"`
	AttributeId int `json:"attribute_id" db:"attribute_id" binding:"required"`
	Value string `json:"value" db:"value" binding:"required,max=255"`
}

type productAttributes struct{
	Attributes []productAttribute `json:"attributes" binding:"required,min=1,unique=AttributeId,dive"`
}

type attributeController struct{}
var AttributeController *attributeController = &attributeController{}

func (a *attributeController) FindAll(ctx *gin.Context){
	attrType:= ctx.Query("type")
	var attributes []models.Attribute
	var err error
	if attrType!=""{
		attributes,err=repository.AttributeRepository.FindType(attrType);
	}else{
		attributes,err=repository.AttributeRepository.FindAll();
	}
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

	err:=repository.AttributeRepository.CreateBulk(data.Attributes...)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusAccepted)
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
	ctx.Status(http.StatusAccepted)
}

func (a *attributeController) Update(ctx *gin.Context){
	var data attributeUpdate
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	id:=ctx.Param("id")
	rows,err:=repository.AttributeRepository.Update(id,data)
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
	ctx.Status(http.StatusAccepted)
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
	ctx.Status(http.StatusOK)
}

