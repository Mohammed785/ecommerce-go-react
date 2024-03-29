import { axiosClient } from "@/axiosClient"
import { useToast } from "@/components/ui/use-toast"
import { AxiosError } from "axios"
import { ReactNode, createContext, useEffect, useState } from "react"

export type CategoryType = {
    id: number,
    name: string,
    parentId: number | null,
}

export type SubCategoryType = {
    id: number,
    name: string,
}

export type CategoryWithSubsType = CategoryType&{
    subs:SubCategoryType[]|null
}

type CategoryContextType = {
    categories:CategoryWithSubsType[],
}

export const CategoryContext = createContext<CategoryContextType>({categories:[]})

export function CategoryProvider({children}:{children:ReactNode}){
    const [categories,setCategories] = useState<CategoryWithSubsType[]>([])
    const { toast } = useToast()
    const loadCategories = async()=>{
        try {
            const response = await axiosClient.get("/category/?subs")
            setCategories(response.data.categories)
        } catch (error) {
            if(error instanceof AxiosError&&error.response?.status!==401){
                toast({title:"Something went wrong while loading categories",variant:"destructive"})
            }
        }
    }
    useEffect(()=>{
        loadCategories()
    },[])
    return <CategoryContext.Provider value={{categories}}>
        {children}
    </CategoryContext.Provider>
}


