import { Slider } from "@/components/ui/slider"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { useState,FormEvent, useRef } from "react"
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

type Filters={
    price:number[],
    subCategories:number[],
    inStock:boolean
}

function ProductFilter(){
    const [filters,setFilters] = useState<Filters>({price:[0,1e4],subCategories:[],inStock:false})
    const [searchParams,_] = useSearchParams()
    const attributesRef = useRef()
    const {toast} = useToast()
    const setSubCategories = (ids:number[])=>{
        setFilters({...filters,subCategories:ids})
    }
    const handleSubmit = async(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try {
            const values = attributesRef?.current?.getValues()
            const valuesIds = values && (Object.values(attributesRef?.current?.getValues()) as { label: string, value: number }[][]).flatMap((vals) => {
                return vals.map(val => val.value)
            })
            const search = new URLSearchParams(location.search)
            search.set("minPrice", filters.price[0].toString())
            search.set("maxPrice", filters.price[1].toString())
            filters.inStock&&search.set("inStock",'1')
            const response = await axiosClient.get(`/product/`,{params:{...Object.fromEntries(search),valuesIds,subs:filters.subCategories}})
        } catch (error) {
            console.error(error);            
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
                    {searchParams.has("sid") && <Attributes ref={attributesRef}/>}
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Slider defaultValue={filters.price} min={0} max={1e4} step={100} onValueCommit={(val)=>setFilters({...filters,price:val})} minStepsBetweenThumbs={1} name="price" />
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