package helpers

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
)


func ParseValidationError(errs ...error) map[string]string{
	details:=make(map[string]string)
	for _,err:= range errs{
		switch typedError:=err.(type){
		case validator.ValidationErrors:
			for _,e:=range typedError{
				details[strings.ToLower(e.Field())] = parseFieldError(e)
			}
		case *json.UnmarshalTypeError:
			details[typedError.Field] = parseMarshalingError(*typedError)
		case *strconv.NumError:
			details["error"] = "please provide valid numbers"
		default:
			if err.Error()=="EOF"{
				details["error"] = "please provide required data"
			}else{
				details["error"] = err.Error()
			}
		}
	}
	return details
}


func parseFieldError(err validator.FieldError) string{
	tag:=strings.Split(err.Tag(), "|")[0]
	switch tag{
	case "required":
		return "field required"
	case "min":
		return fmt.Sprintf("minimum (length/value) allowed is %s",err.Param())
	case "max":
		return fmt.Sprintf("maximum (length/value) allowed is %s",err.Param())
	case "oneof":
		return fmt.Sprintf("only allowed values are %s",err.Param())
	case "email":
		return "invalid email address"
	case "datetime":
		return "invalid date time"
	case "unique":
		return fmt.Sprintf("%s should contain only unique values",err.Param())
	case "eqcsfield":
		return fmt.Sprintf("%s must equal %s",err.Field(),err.Param())
	default:
		return err.Error()
	}
}

func parseMarshalingError(err json.UnmarshalTypeError) string{
	return fmt.Sprintf("%s must be a %s",err.Field,err.Type.String())
}
