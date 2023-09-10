package controllers

import (
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)

type categoryController struct{}

var CategoryController *categoryController = &categoryController{}

type categoryCreate struct{
	Name string `json:"name" binding:"required,max=255"`
	ParentId *int `json:"parent_id" db:"parent_id" binding:"omitempty,min=1"`
}
type categoryUpdate struct{
	Name *string `json:"name" binding:"omitempty,max=255"`
	ParentId *int `json:"parent_id" db:"parent_id" binding:"omitempty,min=1"`
}

func (c *categoryController) Find(ctx *gin.Context){
	_,witSubs := ctx.GetQuery("subs");
	var err error;var categories []models.Category
	if witSubs{
		categories,err = repository.CategoryRepository.ListWithSubs()
		pattren :=`\((.*?)\)`
		re:=regexp.MustCompile(pattren)
		for i,cat := range categories{
			matches := re.FindAllStringSubmatch(*cat.SubsArr,-1)
			for _,match := range matches{
				items := strings.Split(match[1], ",")
				id,_ := strconv.Atoi(items[0])
				item := struct {Id int `json:"id"`;Name string `json:"name"`}{Id:id,Name:items[1]};
				categories[i].Subs = append(categories[i].Subs,item)
			}
		}		
	}else{
		categories,err = repository.CategoryRepository.List()
	}
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return 
	}
	ctx.JSON(http.StatusOK,gin.H{"categories":categories})
}


func (c *categoryController) ListAttributes(ctx *gin.Context){
	categoryId := ctx.Param("id")
	_,withValues := ctx.GetQuery("values")
	categories,err := repository.AttributeRepository.ListCategory(categoryId,withValues);
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.AbortWithStatusJSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
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
	err:=repository.CategoryRepository.Create(data.Name,data.ParentId)
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
	var data categoryUpdate;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	rows,err:=repository.CategoryRepository.Update(id,data)
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
