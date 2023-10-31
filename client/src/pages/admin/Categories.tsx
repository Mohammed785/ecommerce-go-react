import { axiosClient } from "@/axiosClient"
import DataTable from "@/components/Table/DataTable"
import { useToast } from "@/components/ui/use-toast"
import useCategoryContext from "@/hooks/useCategoryContext"
import { ColumnDef } from "@tanstack/react-table"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MoreHorizontal,Trash2Icon,PenIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import CategoryForm from "@/components/admin/CategoryForm"

type CategoryColumnType = {
    id: number,
    name: string,
    parent?:CategoryColumnType
}

const columns:ColumnDef<CategoryColumnType>[] = [
    {
        accessorKey:"name",
        header:"Name"
    },
    {
        accessorKey:"parent",
        header:"Parent",
        cell:({row})=>{
            return row.getValue("parent")?.name||"N/A"
        }
    },
    {
        accessorKey:"id",
        header:"",
        id:"id",
        cell:({row,table})=>{
            const parent = row.getValue("parent")
            const {toast} = useToast()
            const navigator = useNavigate()
            return <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4 p-0">
                        <span className="sr-only">Open Menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1" align="end">
                    <DropdownMenuLabel className="border-b">Actions</DropdownMenuLabel>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={e=>e.preventDefault()} className="bg-red-600 text-white dark:bg-red-700 cursor-pointer">
                                    <Trash2Icon className="h-4 w-4 me-2"/> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    Are you sure you want to delete "{row.getValue("name")}"
                                    <AlertDialogDescription>
                                        You cant undo this action, all the products related to this category will have no category
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => {
                                        const categoryId = row.getValue("id")
                                        try {
                                            await axiosClient.delete(`/category/${categoryId}`)
                                            toast({description:"Category Deleted"}) 
                                            table.options.meta?.removeRow(categoryId)
                                        } catch (error) {
                                            if(error instanceof AxiosError){
                                                if (error.response?.data.code ==="FORBIDDEN"){
                                                    toast({description:"You are not allowed to do this action",variant:"destructive"})
                                                    navigator("/",{replace:true})
                                                }else{
                                                    toast({description:error.response?.data.message,variant:"destructive"})

                                                }
                                                console.error(error);
                                            }
                                        }
                                    }}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault() }} className="text-white bg-blue-700 font-medium text-sm dark:bg-blue-600 cursor-pointer">
                                    <PenIcon className="h-4 w-4 me-2" /> Update
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <CategoryForm category={{ id: row.getValue("id"), name: row.getValue("name"), parentId: parent?.id}}/>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        }
    }
]



function CategoriesPage(){
    const {categories} = useCategoryContext()
    const [data,setData] = useState<CategoryColumnType[]>([])
    useEffect(()=>{
        setData(categories.flatMap((cat) => {
            const parent = { id: cat.id, name: cat.name, parent:undefined}
            return cat.subs ? [parent, ...cat.subs.map((sub) => {
                return { id: sub.id, name: sub.name, parent: { name: cat.name, id: cat.id } }
            })] : parent
        }))
    },[categories])
    const removeRow = (categoryId:number)=>{
        setData(data.filter(row=>(
            row.id!==categoryId
        )))
    }
    return <div className="w-full">
        <CategoryForm className="md:w-2/4 sm:w-full lg:w-2/4 p-2 m-auto" />
        <div className="rounded-md border mt-4 w-2/3 m-auto">
            <DataTable columns={columns} data={data} meta={{ removeRow }} initialState={{ columnVisibility: { parentId: false }}}/>
        </div>
    </div>
}

export default CategoriesPage