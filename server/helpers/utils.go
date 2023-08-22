package helpers

import (
	"strconv"
	"strings"
)

const DEFAULT_LIMIT = 25


type PaginationOptions struct{
	Cursor uint
	Limit uint
	OrderBy string
}

func NewPaginationOptions(cursor, limit,orderBy string) PaginationOptions{
	pagination := PaginationOptions{}
	cur,err := strconv.Atoi(cursor)
	pagination.Cursor = uint(cur);
	if err!=nil{
		pagination.Cursor = 1e6
	}
	limit_,err := strconv.Atoi(limit)
	pagination.Limit = uint(limit_);
	if err!=nil{
		pagination.Limit = DEFAULT_LIMIT
	}
	pagination.OrderBy = strings.ToLower(orderBy)
	if orderBy=="" || !Includes[string]([]string{"DESC","desc","ASC","asc"},orderBy){
		pagination.OrderBy = "desc"
	}
	return pagination
}

func Includes[K comparable](hey []K,needle K)bool{
	for _,ele:=range hey{
		if ele==needle{
			return true
		}
	}
	return false
}