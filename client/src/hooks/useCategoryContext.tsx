import { CategoryContext } from "@/context/CategoryContext"
import { useContext } from "react"

function useCategoryContext(){
    return useContext(CategoryContext)
}
export default useCategoryContext