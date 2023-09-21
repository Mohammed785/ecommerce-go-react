import { Slider } from "@/components/ui/slider"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import SubCategoryFilter from "./Filters/SubCategory"
import CategorySelect from "./Filters/Category"
import Attributes from "./Filters/Attributes"
import { AxiosError } from "axios"
import { axiosClient } from "@/axiosClient"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "../ui/use-toast"
import { FilterIcon } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import useProductContext from "@/hooks/useProductContext"


function ProductFilter(){
    const [searchParams,_] = useSearchParams()
    const {toast} = useToast()
    const { filters, productState, setProductState,setFilters,createSearchParams} = useProductContext()
    const setSubCategories = (ids:number[])=>{
        setFilters({...filters,subCategories:ids})
    }
    const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try {
            setProductState({...productState,loading:true})
            const params = createSearchParams()
            const response = await axiosClient.get(`/product/`,{params})
            console.log(response.data)
            setProductState({products:response.data.products||[],cursor:response.data.cursor,loading:false})
        } catch (error) {
            setProductState({ ...productState, loading: false })
            if(error instanceof AxiosError){
                if(error.response?.data.code==="VALIDATION"){
                    toast({variant:"destructive",description:error.response?.data.details.error})
                }
                toast({variant:"destructive",description:error.response?.data.message})
            }
        }
    }
    return <>
        <Sheet key={"filters"}>
            <SheetTrigger asChild>
                <Button className="fixed z-90 bottom-8 left-4 bg-accent w-20 h-20 rounded-full drop-shadow-lg flex justify-center items-center text-foreground text-4xl hover:bg-foreground hover:drop-shadow-2xl hover:text-accent hover:scale-105 duration-300" variant="outline" size="icon">
                    <FilterIcon/>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="">Product Filters</SheetTitle>
                    <hr className="my-1 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100"/>
                </SheetHeader>
                <form className="h-full w-full mt-4 space-y-3 " onSubmit={handleSubmit}>
                    {!searchParams.has("cid")&&<CategorySelect/>}
                    {(searchParams.has("cid")&& !searchParams.has("sid")) &&<SubCategoryFilter values={filters.subCategories} setSubCategories={setSubCategories} />}
                    {searchParams.has("sid") && <Attributes />}
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Slider defaultValue={filters.price} min={0} max={1e5} step={100} onValueCommit={(val)=>setFilters({...filters,price:val})} minStepsBetweenThumbs={1} name="price" />
                    </div>
                    <div className="items-top flex items-center space-x-2 ">
                        <Checkbox id="stock" className="w-5 h-5 rounded-md ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" name="in_stock" checked={filters.inStock} onCheckedChange={(e) => { setFilters({ ...filters, inStock:e.valueOf() as boolean})}}/>
                        <label
                            htmlFor="stock"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            In Stock Only
                        </label>
                    </div>
                    <Button type="submit" className="mt-4 w-full">Filter</Button>
                </form>
            </SheetContent>
        </Sheet>
    </>
}

export default ProductFilter