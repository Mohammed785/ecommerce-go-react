import { useState,useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "react-router-dom"
import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { useToast } from "@/components/ui/use-toast"

type Category = {
    id: number,
    name: string,
    subs: {
        id: number,
        name: string
    }[]
}

type SubCategoryFilterProps = {
    main?: string,
    sub?: string,
    onValueChange: (val: string) => void
}

function SubCategoryFilter({ sub, onValueChange }: SubCategoryFilterProps) {
    const [category, setCategory] = useState<Category>()
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
    }, [])
    return <>{searchParams.get("cid") && <Select value={sub} onValueChange={onValueChange}>
        <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder={`${category?.name} sub categories`} />
        </SelectTrigger>
        <SelectContent className="capitalize">
            {
                category && category.subs.map((cat) => (
                    <SelectItem key={cat.id} value={`${cat.id}`}>{cat.name}</SelectItem>
                ))
            }
        </SelectContent>
    </Select>}</>
}

export default SubCategoryFilter