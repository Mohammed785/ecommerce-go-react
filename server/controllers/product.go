package controllers

import (
	"database/sql"
	"errors"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)



type productController struct{}

var ProductController *productController = &productController{}

const DEFAULT_LIMIT = 25

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
}


type productUpdate struct{
	Name string `json:"name" binding:"omitempty,max=255"`
	Sku string `json:"sku" binding:"omitempty,min=16,max=16"`
	Description string `json:"description" binding:"omitempty"`
	Price int `json:"price" binding:"omitempty,min=0"`
	Stock int `json:"stock" binding:"omitempty,min=0"`
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
		var pgErr *pgconn.PgError
		if errors.As(err,&pgErr){
			if pgErr.Code=="23505"{
				ctx.JSON(http.StatusBadRequest,gin.H{"message":"sku already exists","code":helpers.UNIQUE_CONSTRAINT})
				return
			}
			if pgErr.Code=="23503"{
				re:=regexp.MustCompile(`=\((\d+)\)`)
				attribute_id := re.FindStringSubmatch(pgErr.Detail)[1]
				ctx.JSON(http.StatusBadRequest,gin.H{"message":"attribute not found","code":helpers.RECORD_NOT_FOUND,"details":gin.H{"attribute_id":attribute_id}})
				return
			}
		}
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	ctx.Status(http.StatusAccepted)
}

func (p *productController) Update(ctx *gin.Context){
	id:=ctx.Param("id")
	var data productUpdate
	if err:=ctx.ShouldBindJSON(data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	rows,err:=repository.ProductRepository.Update(id,data)
	if err!=nil{
		if errors.Is(err,sql.ErrNoRows){
			ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
			return
		}
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
		if errors.Is(err,sql.ErrNoRows){
			ctx.JSON(http.StatusNotFound,gin.H{"message":"product not found","code":helpers.RECORD_NOT_FOUND})
			return
		}
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
		var pgErr *pgconn.PgError
		if errors.As(err,&pgErr){
			if pgErr.Code=="23505"{
				re:=regexp.MustCompile(`(?m)=\((\w+|(\w+, \w+))\)`)
				attribute_id := strings.Split(re.FindStringSubmatch(pgErr.Detail)[1], ", ")[1]
				ctx.JSON(http.StatusBadRequest,gin.H{"message":"product already have this attribute","code":helpers.UNIQUE_CONSTRAINT,"details":gin.H{"attributeId":attribute_id}})
				return
			}else if pgErr.Code=="23503"{
				re:=regexp.MustCompile(`=\((\d+)\)`)
				attribute_id := re.FindStringSubmatch(pgErr.Detail)[1]
				ctx.JSON(http.StatusBadRequest,gin.H{"message":"attribute not found","code":helpers.RECORD_NOT_FOUND,"details":gin.H{"attributeId":attribute_id}})
				return	
			}
		}
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
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