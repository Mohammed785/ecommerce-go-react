import { axiosClient } from "@/axiosClient"
import DataTable from "@/components/Table/DataTable"
import AttributeForm from "@/components/admin/AttributeForm"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ColumnDef } from "@tanstack/react-table"
import { AxiosError } from "axios"
import { MoreHorizontal, PenIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

type AttributeColumnType = {
    id:number,
    name:string,
    categories:{
        id:number,
        name:string
    }[]
    values:{
        id:number,
        value:string
    }[]
}

const columns:ColumnDef<AttributeColumnType>[] = [
    {
        accessorKey:"id",
    },
    {
        accessorKey:"name",
        header:"Name"
    },
    {
        accessorKey:"categories",
        header:"Categories",
        cell:({row})=>{
            const categories= row.getValue("categories") as {id:number,name:string}[]
            return categories.length? categories.map((category:any)=>category.name).join(","):"N/A"
        }
    },
    {
        accessorKey:"values",
        header:"Values",
        cell:({row})=>{
            const values = row.getValue("values") as {id:number,value:string}[]
            return values.length?values.map((value)=>value.value).join(","):"N/A"
        }
    },
    {
        accessorKey:"actions",
        header:"Actions",
        cell:({row,table})=>{
            const { toast } = useToast()
            const navigator = useNavigate()
            return <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4 p-0">
                        <span className="sr-only">Open Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="space-y-1" align="end">
                    <DropdownMenuLabel className="border-b">Actions</DropdownMenuLabel>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={e => e.preventDefault()} className="bg-red-600 text-white dark:bg-red-700 cursor-pointer">
                                <Trash2Icon className="h-4 w-4 me-2" /> Delete
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
                                    const attributeId = row.getValue("id")
                                    try {
                                        await axiosClient.delete(`/attribute/${attributeId}`)
                                        toast({ description: "Attribute Deleted" })
                                        table.options.meta?.removeRow(attributeId)
                                    } catch (error) {
                                        if (error instanceof AxiosError) {
                                            console.error(error);
                                            if (error.response?.data.code === "FORBIDDEN") {
                                                toast({ description: "You are not allowed to do this action", variant: "destructive" })
                                                navigator("/", { replace: true })
                                            } else {
                                                toast({ description: error.response?.data.message, variant: "destructive" })

                                            }
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
                            <AttributeForm attribute={{ id: row.getValue("id"), name: row.getValue("name"), categories: row.getValue("categories"),values:row.getValue("values") }} handleUpdate={(attributeId, values) => {
                                table.options.meta?.updateRow(attributeId, values)
                            }} />
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

function AttributesPage(){
    const [attributes,setAttributes]=useState<AttributeColumnType[]>([])
    const {toast} = useToast()
    const loadAttributes = async()=>{
        try {
            const response=  await axiosClient.get("/product/attribute?category&values")
            setAttributes(response.data.attributes)
        } catch (error) {
            if(error instanceof AxiosError){
                toast({description:error.response?.data.code,variant:"destructive"})
            }
        }
    }
    useEffect(()=>{
        loadAttributes()
    },[])
    return <div className="w-full">
        <AttributeForm className="md:w-2/4 sm:w-full lg:w-2/4 p-2 m-auto" />
        <div className="rounded-md border mt-4 w-2/3 mx-auto">
            {/* initialState:{columnVisibility:{categories:false}} */}
            <DataTable {...{columns,data:attributes,
            }}/>
        </div>
    </div>
}

export default AttributesPage