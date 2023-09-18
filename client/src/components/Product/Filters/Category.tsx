import { axiosClient } from "@/axiosClient"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"

type Category={
    id:number,
    name:string,
    parentId:number|null
}

function CategorySelect(){
    const [categories,setCategories] = useState<Category[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const {toast} = useToast()
    const loadCategories = async()=>{
        try {
            const response = await axiosClient.get("/category/?parents")
            setCategories(response.data.categories)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({ variant: "destructive", description: error.response?.data.message })
            }
        }
    }
    const onChange = (e:string)=>{
        const name=categories.find((val)=>val.id===parseInt(e))?.name
        setSearchParams({"cid":e,"cname":name||""})
    }
    useEffect(()=>{
        loadCategories()
    },[])
    return <>
        <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={onChange} value={searchParams.has("cid")?`${searchParams.get("cid")}`:undefined}>
            <SelectTrigger>
                <SelectValue placeholder="Select Category"/>
            </SelectTrigger>
            <SelectContent className="capitalize">
                {
                    categories.map((cat)=>(
                        <SelectItem key={cat.id} value={`${cat.id}`}>{cat.name}</SelectItem>
                    ))
                }
            </SelectContent>
        </Select>
        </div>
    </>
}

export default CategorySelect