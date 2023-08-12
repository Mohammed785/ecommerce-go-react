package helpers

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
)

func SendValidationError(ctx *gin.Context,validationErr error){
	details:=ParseValidationError(validationErr)
	ctx.JSON(http.StatusBadRequest,gin.H{"code":VALIDATION,"details":details})
}
