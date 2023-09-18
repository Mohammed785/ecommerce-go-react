import { Label } from "@/components/ui/label"
import Select from "@/components/Select"
import { MultiValue } from "react-select"
import { useSearchParams } from "react-router-dom"
import { useToast } from "@/components/ui/use-toast"
import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"


type SubCategoryOption = {
    value: number,
    label: string
}

type SubCategoryFilterProps={
    values:number[],
    setSubCategories:(ids:number[])=>void
}

function SubCategoryFilter({ values,setSubCategories }:SubCategoryFilterProps) {
    const [searchParams,_] = useSearchParams()
    const [subs,setSubs] = useState<SubCategoryOption[]>([])
    const {toast} = useToast()
    const value:SubCategoryOption[] = subs.filter((sub)=>{
        return values.includes(sub.value)
    })
    const loadSubCategories = async () => {
        try {
            const categoryId = searchParams.get("cid")
            if (!categoryId || !parseInt(categoryId)) {
                toast({ description: "Please choose valid category", variant: "destructive" })
                return
            }
            const response = await axiosClient.get(`/category/${categoryId}`)
            const cat = [...response.data.category.subs.map((sub: any) => ({ value: sub.id, label: sub.name }))]
            setSubs(cat)
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({ variant: "destructive", description: error.response?.data.message })
            }
        }
    }
    useEffect(() => {
        if (!searchParams.has("cid")) {
            return
        }
        loadSubCategories()
    }, [searchParams.get("cid")])
    const onChange = (values:MultiValue<SubCategoryOption>)=>{
        setSubCategories(values.map((sub)=>sub.value))
    }
    return <>
    {
        <div className="space-y-2">
            <Label htmlFor="sub">Sub Category</Label>
            <Select options={subs} hideSelectedOptions name="sub" value={value} onChange={onChange} defaultValue={null} isMulti={true} placeholder={`Sub categories`} />
        </div>
    }
    </>
}

export default SubCategoryFilter