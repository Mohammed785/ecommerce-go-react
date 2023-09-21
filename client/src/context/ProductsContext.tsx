import { ReactNode, createContext, useState } from "react";

export type Product = {
    id:number,
    name:string,
    sku:string,
    price:number,
    stock:number,
    image:string
}

type Filters = {
    price: number[],
    subCategories: number[],
    inStock: boolean,
    attributeValues: Record<string, any> | null
}

type ProductStateType = {
    products: Product[], cursor: number | null, loading: boolean
}

type ProductContextType = {
    productState: ProductStateType
    filters:Filters,
    setProductState: (state:ProductStateType)=>void,
    setFilters:(filters:Filters)=>void,
    createSearchParams:()=>Record<string,any>
}

const defaultContext:ProductContextType = {
    productState: { products: [], cursor: null, loading:false },
    filters: { price: [0, 1e5], subCategories: [], inStock: false, attributeValues:null },
    setProductState(_) {},
    setFilters(_) {},
    createSearchParams() {return {}},
}

export const ProductContext = createContext(defaultContext)

function ProductProvider({children}:{children:ReactNode}){
    const [productState, setProductState] = useState<ProductStateType>({products:[],cursor:null,loading:false})
    const [filters,setFilters] = useState({...defaultContext.filters})
    const createSearchParams = (): Record<string, any> =>{
        const valuesIds = filters.attributeValues && (Object.values(filters.attributeValues) as { label: string, value: number }[][]).flatMap((vals) => {
            return vals.map(val => val.value)
        })
        const search = new URLSearchParams(location.search)
        search.set("minPrice", filters.price[0].toString())
        search.set("maxPrice", filters.price[1].toString())
        filters.inStock && search.set("inStock", '1')
        return {...Object.fromEntries(search), valuesIds, subs: filters.subCategories }
    }
    return <ProductContext.Provider value={{productState,setProductState,filters,setFilters,createSearchParams}}>
        {children}
    </ProductContext.Provider>
}


export default ProductProvider