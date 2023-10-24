import { axiosClient } from "@/axiosClient"
import DataTable from "@/components/Table/DataTable"
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import useCategoryContext from "@/hooks/useCategoryContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { ColumnDef } from "@tanstack/react-table"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import * as z from "zod"
import { MoreHorizontal,Trash2Icon,PenIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
    name:z.string({required_error:"Please provide category name"}).max(255,{message:"Name length can't exceed 255 characters"}),
    parentId:z.coerce.number().optional()
})
type HandleUpdateFunc = (categoryId: number, values: z.infer<typeof formSchema>) => void
type FormProps = {
    className?:string,
    category?:{
        id:number,
        name:string,
        parentId:number
    },
    handleUpdate?:HandleUpdateFunc
}

function CategoryForm(props:FormProps){
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema),defaultValues:{
        name:props.category?.name||"",
        parentId:props.category?.parentId
    }})
    const {categories} = useCategoryContext()
    const {toast} = useToast()
    const navigator = useNavigate()
    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        try {
            if(props.category){
                await axiosClient.put(`/category/${props.category.id}`,values)
                props.handleUpdate(props.category.id,values)
            }else{
                await axiosClient.post("/category",values)
            }
            toast({ description: `Category ${props.category?"Update":"Created"}`})
        } catch (error) {
            if(error instanceof AxiosError){
                switch (error.response?.data.code) {
                    case "VALIDATION":
                        for (const [f,e] of Object.entries(error.response.data.details)) {
                            form.setError(f as any,{message:e as string})
                        }
                        break;
                    case "UNIQUE_CONSTRAINT":
                        form.setError("root",{message:"Category Already Exists"})
                        break;
                    case "FORBIDDEN":
                        toast({description:"You are not allowed to do this action",variant:"destructive"})
                        navigator("/",{replace:true})
                        break;
                    default:
                        toast({description:error.response?.data.message,variant:"destructive"})
                        break;
                }
            }
        }
    }
    return <Form {...form}>
        <form method="POST" className={props.className} onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
            name="name"
            control={form.control}
            render={({field})=>(
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input type="text" placeholder="Category Name" {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
            <FormField
                name="parentId"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <FormControl>
                            <Select {...field} onValueChange={(id)=>{
                                field.onChange(parseInt(id))
                            }} value={field.value?.toString()}>
                                <SelectTrigger>Select Parent</SelectTrigger>
                                <SelectContent>
                                    {
                                        categories.map(category=>(
                                            <SelectItem value={`${category.id}`}>{category.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full mt-2">{props.category?"Update":"Create"}</Button>
        </form>
        <FormMessage/>
    </Form>
}
type CategoryColumnType = {
    id: number,
    name: string,
    parent: string,
    parentId: number|null
}

const columns:ColumnDef<CategoryColumnType>[] = [
    {
        accessorKey:"name",
        header:"Name"
    },
    {
        accessorKey:"parent",
        header:"Parent"
    },
    {
        accessorKey:"parentId",
        
    },
    {
        accessorKey:"id",
        header:"",
        id:"id",
        cell:({row,table})=>{
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
                                <CategoryForm category={{id:row.getValue("id"),name:row.getValue("name"),parentId:row.getValue("parentId") as number}} handleUpdate={(categoryId,values)=>{
                                    table.options.meta?.updateRow(categoryId,values)
                                }}/>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        }
    }
]

type TableCategory={
    id: number, name: string, parent: string, parentId: number | null
}

function CategoriesPage(){
    const {categories} = useCategoryContext()
    const [data,setData] = useState<TableCategory[]>([])
    useEffect(()=>{
        setData(categories.flatMap((cat) => {
            const parent = { id: cat.id, name: cat.name, parent: "N/A",parentId:null }
            return cat.subs ? [parent, ...cat.subs.map((sub) => {
                return { id: sub.id, name: sub.name, parent: cat.name,parentId:cat.id }
            })] : parent
        }))
    },[categories])
    const removeRow = (categoryId:number)=>{
        setData(data.filter(row=>(
            row.id!==categoryId
        )))
    }
    const updateRow = (categoryId:number,values:TableCategory)=>{
        const parent = values.parentId?data.find((cat)=>cat.id===values.parentId)?.name!:"N/A"
        setData([...data.filter(row=>row.id!==categoryId),{...values,id:categoryId,parent}])
    }
    return <div className="w-full">
        <CategoryForm className="md:w-2/4 sm:w-full lg:w-2/4 p-2 m-auto" />
        <div className="rounded-md border mt-4 w-2/3 m-auto">
            <DataTable columns={columns} data={data} meta={{ removeRow, updateRow }} initialState={{ columnVisibility: { parentId: false }}}/>
        </div>
    </div>
}

export default CategoriesPage