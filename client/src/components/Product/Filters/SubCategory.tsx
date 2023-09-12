import { useState,useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import Select from "@/components/Select"

type Category = {
    id: number,
    name: string,
    subs: {
        id: number,
        name: string
    }[]
}

type SubCategoryOption = {
    value: number,
    label: string
}

type SubCategoryFilterProps = {
    main?: string,
    sub?: SubCategoryOption[],
    onValueChange: (val: unknown) => void
}

function SubCategoryFilter({ sub, onValueChange }: SubCategoryFilterProps) {
    const [category, setCategory] = useState<Category>()
    const subs = useMemo(()=>category?.subs.map(sub=>({value:sub.id,label:sub.name})),[category])
    const [searchParams, _] = useSearchParams()
    const { toast } = useToast()
    const loadSubCategories = async () => {
        try {
            const categoryId = searchParams.get("cid")
            if (!categoryId || !parseInt(categoryId)) {
                toast({ description: "Please choose valid category", variant: "destructive" })
                return
            }
            const response = await axiosClient.get(`/category/${categoryId}`)
            setCategory(response.data.category)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({ variant: "destructive", description: error.response?.data.message })
            }
        }
    }
    useEffect(() => {
        loadSubCategories()
        onValueChange([])
    }, [searchParams.get("cid")])
    return <>
    {
        searchParams.get("cid")&& <div className="space-y-2">
            <Label htmlFor="sub">Sub Category</Label>
            <Select options={subs} name="sub" onChange={(e)=>onValueChange(e)} defaultValue={null} value={sub} isMulti={true} placeholder={`${category?.name} sub categories`} />
        </div>
    }
    </>
}

export default SubCategoryFilter