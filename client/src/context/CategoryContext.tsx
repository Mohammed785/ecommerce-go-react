import { axiosClient } from "@/axiosClient"
import { useToast } from "@/components/ui/use-toast"
import { ReactNode, createContext, useEffect, useState } from "react"

export type SubCategoryType = {
    id: number,
    name: string,
}

export type CategoryType = {
    id: number,
    name: string,
    parentId: number|null,
    subs:SubCategoryType[]|null
}

type CategoryContextType = {
    categories:CategoryType[]
}

export const CategoryContext = createContext<CategoryContextType>({categories:[]})

export function CategoryProvider({children}:{children:ReactNode}){
    const [categories,setCategories] = useState<CategoryType[]>([])
    const { toast } = useToast()
    const loadCategories = async()=>{
        try {
            const response = await axiosClient.get("/category/?subs")
            setCategories(response.data.categories)
        } catch (error) {
            console.error(error)
            toast({title:"Something went wrong while loading categories",variant:"destructive"})
        }
    }
    useEffect(()=>{
        loadCategories()
    },[])
    return <CategoryContext.Provider value={{categories}}>
        {children}
    </CategoryContext.Provider>
}


