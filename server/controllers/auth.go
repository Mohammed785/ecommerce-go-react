package controllers

import (
	"database/sql"
	"errors"
	"net/http"
	"os"
	"time"

	"github.com/Mohammed785/ecommerce/helpers"
	"github.com/Mohammed785/ecommerce/repository"
	"github.com/doug-martin/goqu/v9"
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
	FirstName string `json:"firstName" db:"first_name" binding:"required,min=2,max=25"`
	LastName string `json:"lastName" db:"last_name" binding:"required,min=2,max=25"`
	Email string `json:"email" db:"email" binding:"required,email"`
	Dob string `json:"dob" db:"dob" binding:"required,datetime=1/2/2006"`
	Password string `json:"password" db:"password" binding:"required,min=8,max=30"`
}

type changePassword struct{
	OldPassword string `json:"old_password" binding:"required,min=2,max=25"`
	NewPassword string `json:"new_password" binding:"required,min=2,max=25"`
}
type selectArg struct{
	Id int
	Password string
	IsAdmin bool `db:"is_admin"`
}

func (a *AuthControllerStruct) Login(ctx *gin.Context){
	var data userCredentials;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	user,err:= repository.UserRepository.FindByEmail(data.Email,&selectArg{});
	if err!=nil && errors.Is(err,sql.ErrNoRows){
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"Wrong credentials","code":helpers.WRONG_CREDENTIALS})
		return
	}
	if err:=bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(data.Password));err!=nil{
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"Wrong credentials","code":helpers.WRONG_CREDENTIALS})
		return
	}
	token,err:= helpers.AuthHelpers.GenerateToken(user.ID,user.IsAdmin);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	ctx.SetCookie("token",token,int(time.Duration(12*time.Hour).Seconds()),"/","",os.Getenv("GIN_MODE")=="release",true)
	ctx.JSON(http.StatusOK,gin.H{"token":token})
}

func (a *AuthControllerStruct) Register(ctx *gin.Context){
	var data userRegister;
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	hash,err := bcrypt.GenerateFromPassword([]byte(data.Password),bcrypt.DefaultCost);
	if err!=nil{
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":err.Error()})
		return
	}
	data.Password = string(hash);
	_,err=repository.UserRepository.Create(data);
	if err!=nil{
		var pgErr *pgconn.PgError
		if errors.As(err,&pgErr){
			if pgErr.Code=="23505"{
				ctx.JSON(http.StatusBadRequest,gin.H{"message":"Email already exists","code":helpers.UNIQUE_CONSTRAINT})
				return 
			}
		}
		ctx.JSON(http.StatusBadRequest,gin.H{"message":err.Error()})
		return	
	}
	ctx.Status(http.StatusOK)
}

func (a *AuthControllerStruct) Logout(ctx *gin.Context){
	ctx.SetCookie("token","",1000,"","",false,true)
	ctx.Status(http.StatusOK)
}

func (a *AuthControllerStruct) ChangePassword(ctx *gin.Context){
	var data changePassword
	if err:=ctx.ShouldBindJSON(&data);err!=nil{
		helpers.SendValidationError(ctx,err)
		return
	}
	userId:=ctx.GetInt("uid");
	user,err:= repository.UserRepository.FindById(userId,&selectArg{})
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
	affected,_:=repository.UserRepository.Update(goqu.C("id").Eq(userId),struct{
		Password string
	}{
		Password:string(newHash),
	})
	if affected==0{
		ctx.JSON(http.StatusNotFound,gin.H{"message":"User not found","code":helpers.RECORD_NOT_FOUND})
		return
	}
	ctx.Status(http.StatusAccepted)
}

