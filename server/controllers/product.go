package controllers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/doug-martin/goqu/v9"
	"github.com/gin-gonic/gin"
)



type productController struct{}

var ProductController *productController = &productController{}


type product struct{
	Product productCreate
	Attributes []models.ProductAttribute `json:"attributes" binding:"dive"`
}

type productCreate struct{
	Name string `json:"name" binding:"required,max=255"`
	Sku string `json:"sku" binding:"required,min=16,max=16"`
	Description *string `json:"description" binding:"omitempty"`
	Price float64 `json:"price" binding:"required,min=0"`
	Stock int `json:"stock" binding:"required,min=0"`
	CategoryId int `json:"category_id" binding:"required,min=1" db:"category_id"`
}


type productUpdate struct{
	Name string `json:"name" binding:"omitempty,max=255"`
	Sku string `json:"sku" binding:"omitempty,min=16,max=16"`
	Description string `json:"description" binding:"omitempty"`
	Price int `json:"price" binding:"omitempty,min=0"`
	Stock int `json:"stock" binding:"omitempty,min=0"`
}

func (p *productController) Find(ctx *gin.Context){
	pagination := helpers.NewPaginationOptions(ctx.Query("cursor"),ctx.Query("limit"),ctx.Query("orderBy"))
	exp := goqu.Ex{
		"deleted_at":nil,
	}
	if ctx.Query("category")!=""{
		exp["category_id"] = ctx.Query("category")
	}
	products,err:= repository.ProductRepository.Find(exp,&pagination,models.ProductFind{})
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	var cursor *int;
	if len(products)<int(pagination.Limit){
		cursor = nil;
	}else{
		last:=products[len(products)-1]
		cursor=&last.Id
	}
	ctx.JSON(http.StatusOK,gin.H{"products":products,"cursor":cursor})
}

func (p *productController) FindOne(ctx *gin.Context){
	productId:=ctx.Param("id")
	product,err:=repository.ProductRepository.FindOne(productId)
	if err!=nil{
		if errors.Is(err,sql.ErrNoRows){
			ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
			return
		}
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	ctx.JSON(200,gin.H{"product":product})
}

func (p *productController) Create(ctx *gin.Context){
	var data product;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	err:=repository.ProductRepository.Create(&data.Product,data.Attributes)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusAccepted)
}

func (p *productController) Update(ctx *gin.Context){
	id:=ctx.Param("id")
	var data productUpdate
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	rows,err:=repository.ProductRepository.Update(id,data)
	if err!=nil{
		ctx.JSON(http.StatusNotFound,gin.H{"message":err.Error()})
		return
	}
	if rows==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
}

func (p *productController) Delete(ctx *gin.Context){
	id:=ctx.Param("id")
	_,hard:=ctx.GetQuery("hard")
	rows,err:=repository.ProductRepository.Delete(id,hard)
	if err!=nil{
		ctx.JSON(http.StatusNotFound,gin.H{"message":err.Error()})
		return
	}
	if rows==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusOK)
}

func (p *productController) AddProductAttributes(ctx *gin.Context){
	var attributes productAttributes
	if err:=ctx.ShouldBindJSON(&attributes);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	productId,err:=strconv.Atoi(ctx.Param("id"))
	if err!=nil{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	for i := 0; i < len(attributes.Attributes); i++ {
		attributes.Attributes[i].ProductId = productId;
	}
	err=repository.ProductRepository.AddAttributes(productId,attributes.Attributes)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusAccepted)
}

func (p *productController) DeleteProductAttribute(ctx *gin.Context){
	attributes := struct{
		Attributes []int `json:"attributes" binding:"required,min=1,unique"` 
	}{
		Attributes: []int{},
	}
	if err:=ctx.ShouldBindJSON(&attributes);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	productId := ctx.Param("id")
	err:= repository.ProductRepository.RemoveAttribute(productId,attributes.Attributes)
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return	
	}
	ctx.Status(http.StatusOK)
}