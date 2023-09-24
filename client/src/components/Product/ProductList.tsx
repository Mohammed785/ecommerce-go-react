import { axiosClient } from "@/axiosClient";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { useEffect } from "react";
import ProductCard from "./ProductCard";
import useProductContext from "@/hooks/useProductContext";
import ProductCardSkeleton from "./CardSkeleton";

function ProductList(){
    const {productState,setProductState,createSearchParams} = useProductContext()
    const { toast } = useToast()
    const loadProducts = async () => {
        try {
            setProductState({...productState,loading:true})
            const params = createSearchParams()
            const response = await axiosClient.get("/product/",{params})
            setProductState({products:productState.products.concat(response.data.products||[]),cursor:response.data.cursor||-1,loading:false})
        } catch (error) {
            setProductState({...productState,loading:false})
            if (error instanceof AxiosError) {
                toast({ description: error.message })
            }
        }
    }
    useEffect(() => {
        function checkScroll(_: Event) {
            if ((window.scrollY + window.innerHeight) >= document.body.scrollHeight && productState.cursor !== -1) {
                loadProducts()                
            }
        }
        loadProducts()
        window.addEventListener("scroll", checkScroll)
        return () => window.removeEventListener("scroll", checkScroll)
    }, [])
    return <>
    <div className="w-fit mx-auto grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 justify-items-center justify-center gap-y-12 gap-x-14 lg:gap-x-12 mt-10 mb-5 ">
        {
            productState.loading?new Array(productState.products.length||8).fill(0).map((_,i)=><ProductCardSkeleton key={i}/>)
            :productState.products.map((product)=>(<ProductCard key={product.id} product={product}/>))
        }
    </div>
    </>
}

export default ProductList