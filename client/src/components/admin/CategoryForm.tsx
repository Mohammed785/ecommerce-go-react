import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useCategoryContext from "@/hooks/useCategoryContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"

const formSchema = z.object({
    name: z.string({ required_error: "Please provide category name" }).max(255, { message: "Name length can't exceed 255 characters" }),
    parentId: z.string().transform((id) => id ? parseInt(id) : null)
})
type HandleUpdateFunc = (categoryId: number, values: z.infer<typeof formSchema>) => void
type FormProps = {
    className?: string,
    category?: {
        id: number,
        name: string,
        parentId: number
    },
    handleUpdate?: HandleUpdateFunc
}

function CategoryForm(props: FormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), defaultValues: {
            name: props.category?.name || "",
            parentId: props.category?.parentId?.toString()||""
        }
    })
    const { categories } = useCategoryContext()
    const { toast } = useToast()
    const navigator = useNavigate()
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        
        try {
            if (props.category) {
                await axiosClient.put(`/category/${props.category.id}`, values)
                props.handleUpdate?.(props.category.id, values)
            } else {
                await axiosClient.post("/category/", values)
            }
            toast({ description: `Category ${props.category ? "Update" : "Created"}` })
        } catch (error) {
            console.error(error);            
            if (error instanceof AxiosError) {
                switch (error.response?.data.code) {
                    case "VALIDATION":
                        for (const [f, e] of Object.entries(error.response.data.details)) {
                            form.setError(f as any, { message: e as string })
                        }
                        break;
                    case "UNIQUE_CONSTRAINT":
                        toast({ description: "Category Already Exists" ,variant:"destructive"})
                        break;
                    case "FORBIDDEN":
                        toast({ description: "You are not allowed to do this action", variant: "destructive" })
                        navigator("/", { replace: true })
                        break;
                    default:
                        toast({ description: error.response?.data.message, variant: "destructive" })
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
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Category Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                name="parentId"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <FormControl>
                            <Select {...field}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Parent"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={""}>No Parent</SelectItem>
                                    {
                                        categories.map(category => (
                                            <SelectItem key={category.id} value={`${category.id}`}>{category.name}</SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full mt-2">{props.category ? "Update" : "Create"}</Button>
        </form>
        <FormMessage />
    </Form>
}
export default CategoryForm;