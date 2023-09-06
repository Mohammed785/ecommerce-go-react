package helpers

import (
	"strconv"
	"strings"
	"database/sql/driver"
	"reflect"
	"time"
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

func Map[T any,O any](items []T,fn func(T) O) []O{
	mapped:=make([]O,0,len(items))
	for _,item:=range items{
		mapped = append(mapped, fn(item))
	}
	return mapped
}


func FlattenStruct(i interface{}) interface{} {
	v := reflect.ValueOf(i)
	if v.Kind() == reflect.Interface||v.Kind()==reflect.Ptr {
		v = v.Elem()
	}
	switch v.Kind() {
	case reflect.Map:
		return i
	case reflect.Struct:
		m := make(map[string]interface{})
		mapRecursion(v, "", m)
		return m
	case reflect.Slice:
		mm := make([]map[string]interface{}, v.Len())
		for i := 0; i < v.Len(); i++ {
			vv := v.Index(i)
			m := make(map[string]interface{})
			mapRecursion(vv, "", m)
			mm[i] = m
		}
		return mm
	}
	return map[string]interface{}{}
}
func mapRecursion(v reflect.Value, mapKey string, m map[string]interface{}) {
	switch v.Kind() {
	case reflect.Interface,reflect.Ptr:
		if !v.IsNil() {
			mapRecursion(v.Elem(), mapKey, m)
		}
	case reflect.Struct:
		switch t := v.Interface().(type) {
		case time.Time:
			if !t.IsZero() {
				m[mapKey] = v.Interface()
			}
		case driver.Valuer:
			m[mapKey] = v.Interface()
		default:
			for i := 0; i < v.NumField(); i++ {
				val := v.Field(i)
				tf := v.Type().Field(i)
				q := tf.Tag.Get("db")
				if q == "-" {
					continue
				}
				if q!=""{
					mapRecursion(val, q, m)
				}else{
					mapRecursion(val,tf.Name,m)
				}
			}
		}
	case reflect.Map:
		iter := v.MapRange()
		for iter.Next() {
			k := iter.Key()
			v := iter.Value()
			mapRecursion(v, k.String(), m)
		}
	default:
		if v.CanInterface() && mapKey != "" {
			m[strings.ToLower(mapKey)] = v.Interface()
		}
	}
}
