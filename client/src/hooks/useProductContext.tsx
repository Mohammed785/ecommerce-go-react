import { ProductContext } from "@/context/ProductsContext"
import { useContext } from "react"


function useProductContext(){
    return useContext(ProductContext)
}

export default useProductContext