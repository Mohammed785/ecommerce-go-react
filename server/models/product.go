package models

import "time"

type ProductDetails struct{
	Product Product
	Category Category
	Attributes []Attribute
}

type Product struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Description *string `db:"description" json:"description"`
	Price float64 `db:"price" json:"price"`
	Stock int `db:"stock" json:"stock"`
	Sku string `db:"sku" json:"sku"`
	CreatedAt *time.Time `db:"created_at" json:"created_at"`
	DeletedAt *time.Time `db:"deleted_at" json:"deleted_at"`
	CategoryId *int `db:"category_id" json:"category_id"`
	CategoryName *string `db:"category_name" json:"category_name"`
	Attributes []ProductAttributes `json:"attributes"`
}

type Category struct{
	Id int `db:"id"`
	Name string `db:"name"`
}

type Attribute struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name" binding:"required,max=255"`
	AttributeType string `db:"attribute_type" json:"attribute_type" binding:"omitempty,oneof text number date time datetime" goqu:"defaultifempty"`
}

type ProductAttributes struct{
	Id int `db:"id" json:"id"`
	Value string `db:"value" json:"value"`
	AttributeType string `db:"attribute_type" json:"attribute_type"`
}

type ProductAttribute struct{
	AttributeId int `json:"attribute_id" db:"attribute_id" binding:"required"`
	Value string `json:"value" binding:"required,max=255"`
}

type ProductFind struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Price float64 `db:"price" json:"price"`
}