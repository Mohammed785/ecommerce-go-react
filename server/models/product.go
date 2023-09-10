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
	CreatedAt *time.Time `db:"created_at" json:"createdAt"`
	DeletedAt *time.Time `db:"deleted_at" json:"deletedAt"`
	Category *Category `db:"cat"`
	Attrs *string `json:"-" db:"attrs"`
	Imgs *string `json:"-" db:"imgs"`
	Images []ProductImage `json:"images" db:"-"`
	Attributes []ProductAttributes `json:"attributes" db:"-"`
}

type Category struct{
	Id int `json:"id"`
	Name string `json:"name"`
	ParentId *int `json:"parentId" db:"parent_id"`
	SubsArr *string `json:"-" db:"subs"`
	Subs []struct{Id int `json:"id"`;Name string `json:"name"`} `json:"subs" db:"-"`
}

type Attribute struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name" binding:"required,max=255"`
}

type ProductAttributes struct{
	AttributeId int `json:"attributeId"`
	ValueId int `json:"valueId"`
	Name string `json:"name"`
	Value string `json:"value"`
}

type ProductAttribute struct{
	AttributeId int `json:"attributeId" db:"attribute_id" binding:"required,min=1"`
	ValueId int `json:"valueId" binding:"required,min=1"`
}

type ProductImage struct{
	Id int `json:"id"`
	Name string `json:"name"`
	IsPrimary bool `json:"isPrimary"`
}

type ProductSearch struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Price float64 `db:"price" json:"price"`
	Image *string `db:"image" json:"image"`
	Rank float64 `json:"-"`
	Category *Category `json:"category" db:"cat"`
}

type ProductFind struct{
	Id int `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	Sku string `db:"sku" json:"sku"`
	Price float64 `db:"price" json:"price"`
	Image string `db:"img_name" json:"image"`
}