package controllers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/models"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)


type AuthControllerStruct struct {}

var AuthController *AuthControllerStruct = &AuthControllerStruct{};

type userCredentials struct{
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=30"`
}

type userRegister struct{
	FirstName string `json:"firstName" binding:"required,min=2,max=25"`
	LastName string `json:"lastName" binding:"required,min=2,max=25"`
	Email string `json:"email" binding:"required,email"`
	Dob string `json:"dob" binding:"required,datetime=1/2/2006"`
	Gender string `json:"gender" binding:"required,oneof= M F"`
	Password string `json:"password" binding:"required,min=8,max=30"`
}

type changePassword struct{
	OldPassword string `json:"old_password" binding:"required,min=2,max=25"`
	NewPassword string `json:"new_password" binding:"required,min=2,max=25"`
}
type selectArg struct{
	Id string
	Password string
	IsAdmin string `db:"is_admin"`
}
func (a *AuthControllerStruct) Login(ctx *gin.Context){
	var data userCredentials;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"err":err.Error()})
		return
	}
	user,err:= repository.UserRepository.FindByEmail(data.Email,&selectArg{});
	if err!=nil && errors.Is(err,sql.ErrNoRows){
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"Wrong credentials"})
		return
	}
	if err:=bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(data.Password));err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"Wrong credentials"})
		return
	}
	token,err:= helpers.AuthHelpers.GenerateToken(user.ID,user.IsAdmin);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"err":err.Error()})
		return
	}
	ctx.SetCookie("token",token,int(time.Duration(12*time.Hour).Seconds()),"/","",os.Getenv("GIN_MODE")=="release",true)
	ctx.JSON(http.StatusOK,gin.H{"token":token})
}

func (a *AuthControllerStruct) Register(ctx *gin.Context){
	var data userRegister;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"err":err.Error()})
		return
	}
	userId,err:=repository.UserRepository.Create(&models.User{FirstName: data.FirstName,LastName: data.LastName,Email: data.Email,Password: data.Password,Dob: data.Dob,Gender: data.Gender})
	if err!=nil{
		var pgErr *pgconn.PgError
		if errors.As(err,&pgErr){
			fmt.Println(pgErr.Code,pgErr.ColumnName,pgErr.ConstraintName,pgErr.Where,pgErr.TableName)
			if pgErr.Code=="23505"{
				columnName:= strings.Split(pgErr.ConstraintName, "_")[2];
				ctx.JSON(http.StatusBadRequest,gin.H{"message":fmt.Sprintf("%s already exists",columnName)})
				return 
			}
		}
		ctx.JSON(http.StatusBadRequest,gin.H{"err":err.Error()})
		return	
	}
	ctx.JSON(http.StatusOK,gin.H{"id":userId})
}

func (a *AuthControllerStruct) Logout(ctx *gin.Context){
	ctx.SetCookie("token","",1000,"","",false,true)
	ctx.JSON(http.StatusOK,gin.H{"message":"Logged out"})
}

func (a *AuthControllerStruct) ChangePassword(ctx *gin.Context){
	var data changePassword
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"err":err.Error()})
		return
	}
	user,err:= repository.UserRepository.FindById("1",&selectArg{})
	if err!=nil && errors.Is(err,sql.ErrNoRows){
		ctx.JSON(http.StatusNotFound,gin.H{"message":"Please login and try again"})
		return
	}
	if err:=bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(data.OldPassword));err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"Old password is wrong"})
		return
	}
	newHash,err:=bcrypt.GenerateFromPassword([]byte(data.NewPassword),bcrypt.DefaultCost);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	affected,_:=repository.UserRepository.Update("1",struct{
		Password string
	}{
		Password:string(newHash),
	})
	if affected==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"User not found"})
		return
	}
	ctx.JSON(http.StatusAccepted,gin.H{})
}

