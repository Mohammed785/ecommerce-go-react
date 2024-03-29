package controllers

import (
	"database/sql"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/doug-martin/goqu/v9"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)



type productController struct{}

var ProductController *productController = &productController{}


type product struct{
	Product productCreate `json:"product" binding:"required,dive"`
	Attributes []models.ProductAttribute `json:"attributes" form:"attributes" binding:"required,min=1,unique=AttributeId,dive"`
}

type productCreate struct{
	Name string `json:"name" form:"name" binding:"required,max=255"`
	Sku string `json:"sku" form:"sku" binding:"required,min=12,max=12"`
	Description *string `json:"description" form:"description" binding:"omitempty"`
	Price float64 `json:"price" form:"price" binding:"required,min=0"`
	Stock int `json:"stock" form:"stock" binding:"required,min=0"`
	CategoryId int `json:"categoryId" form:"categoryId" binding:"required,min=1" db:"category_id"`
}

type productImage struct{
	Image []*multipart.FileHeader `form:"image" binding:"required,max=4"`
	Primary []bool `form:"primary" binding:"required,eqcsfield=Image"`
}

type productUpdate struct{
	Name *string `json:"name" binding:"omitempty,max=255"`
	Sku *string `json:"sku" binding:"omitempty,min=12,max=12"`
	Description *string `json:"description" binding:"omitempty"`
	Price *float64 `json:"price" binding:"omitempty,min=0"`
	Stock *int `json:"stock" binding:"omitempty,min=0"`
	CategoryId *int `json:"categoryId" form:"categoryId" db:"category_id" binding:"omitempty,min=1"`
}

type productAttribute struct{
	ProductId int `json:"-" db:"product_id"`
	AttributeId int `json:"attributeId" db:"attribute_id" binding:"required,min=1"`
	ValueId int `json:"valueId" db:"value_id" binding:"required,min=1"`
}

type productAttributes struct{
	Attributes []productAttribute `json:"attributes" binding:"required,min=1,unique=AttributeId,dive"`
}

func (p *productController) Search(ctx *gin.Context){
	keyword,exists:=ctx.GetQuery("q")
	if !exists{
		ctx.AbortWithStatusJSON(http.StatusBadRequest,gin.H{"message":"Please provide a keyword to search for","code":helpers.WRONG_QUERY_PRAM})
		return 
	}
	pagination := helpers.NewPaginationOptions(ctx.Query("cursor"),ctx.Query("limit"),ctx.Query("order"))
	products,err:=repository.ProductRepository.Search(keyword,&pagination)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product"){
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
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

func (p *productController) Find(ctx *gin.Context){
	var params repository.FindQueryParams;
	if err:=ctx.ShouldBind(&params);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	pagination := helpers.NewPaginationOptions(ctx.Query("cursor"),ctx.Query("limit"),ctx.Query("order"))
	products,err:= repository.ProductRepository.Find(&params,&pagination)
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
	productId,err:=repository.ProductRepository.Create(&data.Product,data.Attributes)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK,gin.H{"productId":productId})
}

func (p *productController) AddImages(ctx *gin.Context){
	var data productImage
	if err:=ctx.ShouldBind(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	productId := ctx.Param("productId")
	count,err:=repository.ProductRepository.CheckImagesLimit(productId)
	if err!=nil{
		helpers.HandleDatabaseErrors(ctx,err,"product images")
		return
	}
	// maximum images for one product is 4
	if count==4{
		ctx.AbortWithStatusJSON(http.StatusBadRequest,gin.H{"message":"You have already reached the maximum image count for this product"})
		return
	}
	if count+len(data.Image)>4{
		ctx.AbortWithStatusJSON(http.StatusBadRequest,gin.H{"message":fmt.Sprintf("You can only upload %d more image(s)", 4-count)})
		return
	}
	images := make([]goqu.Record,0,len(data.Image))
	primaryImg:=false
	for i := 0; i < len(data.Image); i++ {
		fileName:=uuid.NewString()+filepath.Ext(data.Image[i].Filename)
		if err:=ctx.SaveUploadedFile(data.Image[i],filepath.Join("uploads",fileName));err!=nil{
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":"unable to save file","details":gin.H{"file":data.Image[i].Filename}})
		}
		if primaryImg && data.Primary[i]{
			data.Primary[i] = false
		}
		if data.Primary[i]{
			primaryImg = true
		}
		images = append(images, goqu.Record{"img_name":fileName,"primary_img":data.Primary[i],"product_id":productId})
	}
	if !primaryImg{
		images[0]["primary_img"] = true
	}
	err=repository.ProductRepository.AddImages(productId,primaryImg,images...)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product images"){
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.Status(http.StatusNoContent)
}

func (p *productController) UpdateImage(ctx *gin.Context){
	productId := ctx.Param("productId")	
	imageId := ctx.Param("imageId")	
	rows,err:= repository.ProductRepository.UpdateImage(imageId,productId)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product images"){
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	if rows==0{
		ctx.AbortWithStatusJSON(http.StatusNotFound,gin.H{"message":"image not found","code":helpers.RECORD_NOT_FOUND})
		return 
	}
	ctx.Status(http.StatusNoContent)
}

func (p *productController) DeleteImages(ctx *gin.Context){
	var data struct{
		Ids []int `json:"ids" binding:"required,min=1,dive,min=1"`
	}
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err);
		return
	}
	productId := ctx.Param("productId")
	images_names,err:= repository.ProductRepository.DeleteImages(productId,data.Ids)
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"product images"){
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	for _, name := range images_names {
		filePath:=filepath.Join("uploads",name)
		err = os.Remove(filePath)
		if err!=nil{
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":"failed to delete file from uploaded folder","details":gin.H{"filename":name}})
			return
		}
	}
	ctx.Status(http.StatusNoContent)
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
	ctx.Status(http.StatusNoContent)
}

func (p *productController) Delete(ctx *gin.Context){
	id:=ctx.Param("id")
	_,hard:=ctx.GetQuery("hard")
	// delete images if hard
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
	ctx.Status(http.StatusNoContent)
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
	ctx.Status(http.StatusNoContent)
}