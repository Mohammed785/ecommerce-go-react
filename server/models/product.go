package models

import "time"


type Product struct{
	Id int `db:"id"`
	Name string `db:"name"`
	Description string `db:"description"`
	Price float64 `db:"price"`
	Stock int `db:"stock"`
	Sku string `db:"sku"`
	CreatedAt *time.Time `db:"crated_at"`
	DeletedAt *time.Time `db:"deleted_at"`
	CategoryId int `db:"category_id"`
	Category *Category `db:"cat"`
	Attributes *ProductAttributes `db:"attrs"`
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
	Value string `db:"value"`
	Attribute *Attribute
}

type ProductAttribute struct{
	AttributeId int `json:"attribute_id" db:"attribute_id" binding:"required"`
	ProductId int `json:"product_id" db:"product_id" binding:"required"`
	Value string `json:"value" binding:"required,max=255"`
}
