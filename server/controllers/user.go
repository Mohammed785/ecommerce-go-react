package controllers

import (
	"net/http"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
)


type userController struct {}

var UserController *userController = &userController{}


func (u *userController) Me(ctx *gin.Context){
	userId := ctx.GetFloat64("uid")
	user,err:=repository.UserRepository.FindById(int(userId),models.User{})
	if err!=nil{
		if !helpers.HandleDatabaseErrors(ctx,err,"attribute"){
			ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK,gin.H{"user":user})
}