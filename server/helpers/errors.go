package helpers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

type ErrorCode string;


const (
	VALIDATION ErrorCode = "VALIDATION"
	RECORD_NOT_FOUND ErrorCode = "RECORD_NOT_FOUND"
	INTERNAL_SERVER_ERROR ErrorCode = "INTERNAL_SERVER_ERROR"
	WRONG_CREDENTIALS ErrorCode = "WRONG_CREDENTIALS"
	UNIQUE_CONSTRAINT ErrorCode = "UNIQUE_CONSTRAINT"
	BAD_REQUEST ErrorCode = "BAD_REQUEST"
	UNAUTHORIZED ErrorCode = "UNAUTHORIZED"
	FORBIDDEN ErrorCode = "FORBIDDEN"
	WRONG_QUERY_PRAM ErrorCode = "WRONG_QUERY_PARM"
	WRONG_PRAM ErrorCode = "WRONG_PARAM"
	TOKEN_EXPIRED ErrorCode = "TOKEN_EXPIRED"
	TOKEN_INVALID ErrorCode = "TOKEN_INVALID"
	INVALID_FOREIGN_KEY ErrorCode = "INVALID_FOREIGN_KEY"
	DATABASE_ERROR ErrorCode = "DATABASE_ERROR"
)

func SendValidationError(ctx *gin.Context,validationErr error){
	details:=ParseValidationError(validationErr)
	ctx.JSON(http.StatusBadRequest,gin.H{"code":VALIDATION,"details":details})
}


func HandleDatabaseErrors(ctx *gin.Context,err error,table string) bool {
	var pgErr *pgconn.PgError
	isDBError := true;
	if errors.Is(err,sql.ErrNoRows){
		ctx.JSON(http.StatusNotFound,gin.H{"message":fmt.Sprintf("%s not found", table),"code":RECORD_NOT_FOUND})
	}else if errors.Is(err,sql.ErrTxDone){
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"transaction has already been committed","code":DATABASE_ERROR})
	}else if errors.As(err,&pgErr){
		handlePgErr(ctx,pgErr)
	}else{
		isDBError = false
	}
	return isDBError
}

func handlePgErr(ctx *gin.Context,pgErr *pgconn.PgError) {
	switch pgErr.Code{
	case "23505":
		re:= regexp.MustCompile(`\(([^)]+)\)=\(([^)]+)\)`)
		matches := re.FindStringSubmatch(pgErr.Detail)
		names:=strings.Split(re.FindStringSubmatch(pgErr.Detail)[1], ", ")
		values:=strings.Split(re.FindStringSubmatch(pgErr.Detail)[2], ", ")
		var columnName,columnValue string;
		if len(names)==1{
			columnName = matches[1]
			columnValue = matches[2]
		}else{
			columnName = names[1]
			columnValue = values[1]
		}
		ctx.JSON(http.StatusBadRequest,gin.H{"message":fmt.Sprintf("%s already exists",columnName),"code":UNIQUE_CONSTRAINT,"details":gin.H{columnName:columnValue}})
	case "23503":
		re:=regexp.MustCompile(`\(([^)]+)\)=\(([^)]+)\)`)
		matches := re.FindStringSubmatch(pgErr.Detail)
		columnName := matches[1]
		columnValue := matches[2]
		ctx.JSON(http.StatusBadRequest,gin.H{"message":fmt.Sprintf("%s not found",columnName),"code":INVALID_FOREIGN_KEY,"details":gin.H{columnName:columnValue}})
	case "23514":
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"please check that all field have correct data","code":VALIDATION})
	case "23502":
		ctx.JSON(http.StatusBadRequest,gin.H{"message":"please provide all the required data","code":VALIDATION})
	default:
		ctx.JSON(http.StatusInternalServerError,gin.H{"message":pgErr.Message,"code":DATABASE_ERROR,"details":gin.H{"pgCode":pgErr.Code}})
	}
	
}