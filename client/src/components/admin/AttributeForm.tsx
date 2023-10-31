import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Select from "@/components/Select"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import useCategoryContext from "@/hooks/useCategoryContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import MultiValueInput from "../MultiInput"
import { useState } from "react"
import { ActionMeta, MultiValue } from "react-select"

const formSchema = z.object({
    name: z.string({ required_error: "Please provide an attribute name" }).min(1, { message:"Please provide an attribute name"}),
    values: z.array(z.object({ label: z.string(), value: z.string() })).refine(items => new Set(items.map(item=>item.value)).size === items.length, {
        message: "You can't add duplicate attributes",
    }),
    categoriesIds: z.array(z.object({label:z.string(),value:z.number()})).refine(items => new Set(items.map(item=>item.value)).size === items.length, {
        message: "You can't add duplicate attributes",
    })
})

type FormProps = {
    className?: string,
    attribute?: {
        id: number,
        name: string,
        categories: {id:number,name:string}[]
        values:{id:number,value:string}[]
    },
}

type UpdateInfo = {
    values:{
        toAdd: string[],toDelete: number[]
    },
    categories:{
        toAdd: number[],toDelete: number[]
    }
}

function AttributeForm(props:FormProps){
    const {categories} = useCategoryContext()
    const {toast} = useToast()
    const navigator = useNavigate()
    const [inputValue,setInputValue] = useState("")
    const [updateInfo,setUpdateInfo] = useState<UpdateInfo>({values:{toAdd:[],toDelete:[]},categories:{toAdd:[],toDelete:[]}})
    const form = useForm<z.infer<typeof formSchema>>({resolver:zodResolver(formSchema),defaultValues:{
        name:props.attribute?.name||"",
        categoriesIds:props.attribute?.categories.map(cat=>({value:cat.id,label:cat.name}))||[],
        values:props.attribute?.values.map(val=>({value:val.id.toString(),label:val.value}))||[]
    }})
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (props.attribute) {
                let attribute = {...updateInfo,name:values.name};
                await axiosClient.put(`/product/attribute/${props.attribute.id}`, attribute)
            } else {
                let attribute = {...values,values:values.values.map(val=>val.value),categoriesIds:values.categoriesIds.map(cat=>cat.value)}
                await axiosClient.post("/product/attribute", {attributes:[attribute]})
            }
            toast({ description: `Attribute ${props.attribute ? "Update" : "Created"}` })
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
                        form.setError("root", { message: "Attribute Already Exists" })
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
    const handleChange = (type:"values"|"categories",value: MultiValue<{ label: string, value: number|string }>, action: ActionMeta<{ label: string, value: number|string }>)=>{
        if(!props.attribute){
            return
        }
        if (["deselect-option", "remove-value", "pop-value"].includes(action.action)){
            if(action.removedValue){
                if(type==="values"){
                    let toAdd = updateInfo.values.toAdd.filter((val)=>val!==action.removedValue?.value)
                    setUpdateInfo({ ...updateInfo, values: {toAdd, toDelete: [...updateInfo.values.toDelete, parseInt(action.removedValue.value as string)] } })
                }else{
                    
                    let toAdd = updateInfo.categories.toAdd.filter((val)=>val!==action.removedValue?.value)
                    setUpdateInfo({ ...updateInfo, categories: { toAdd, toDelete: [...updateInfo.categories.toDelete, action.removedValue?.value as number] } })  
                }
            }
        }else if(action.action==="clear"){
            const ids = action.removedValues.map(val=>(parseInt(val.value)))
            type==="values"?setUpdateInfo({...updateInfo,values:{toAdd:[],toDelete:ids}}):setUpdateInfo({...updateInfo,categories:{toAdd:[],toDelete:ids}})
        } else if (action.action==="select-option"){
            setUpdateInfo({ ...updateInfo, categories: { ...updateInfo.categories, toAdd: [...updateInfo.categories.toAdd,action.option?.value as number]}})
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
                        <Input placeholder="Attribute Name" {...field}/>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
            <FormField
                name="values"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Attribute Values</FormLabel>
                        <FormControl>
                            <MultiValueInput {...field} inputValue={inputValue} onInputChange={(inp)=>setInputValue(inp)} onKeyDown={(e)=>{
                                switch (e.key) {
                                    case "Enter":
                                    case "Tab":
                                        field.onChange([...field.value||[],{label:inputValue,value:inputValue}])
                                        setInputValue("")
                                        setUpdateInfo({
                                            ...updateInfo,
                                            values:{...updateInfo.values,toAdd:[...updateInfo.values.toAdd,inputValue]}
                                        })
                                        e.preventDefault()
                                }
                            }} onChange={(v, a) => {
                                handleChange("values",v, a);
                                field.onChange(v);
                            }}/>
                        </FormControl>
                        <FormDescription>Type something and press Enter or Tab...</FormDescription>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <FormField
                name="categoriesIds"
                control={form.control}
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Attribute Categories</FormLabel>
                        <FormControl>
                            <Select placeholder="Select Categories" isMulti options={categories.flatMap((category) => {
                                return [{ label: category.name, value: category.id }, ...category.subs?.map(sub => ({ label: sub.name, value: sub.id })) || []]
                            })} {...field} onChange={(v,a)=>{
                                handleChange("categories",v,a);
                                field.onChange(v);
                            }}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <Button type="submit" className="w-full mt-2">{props.attribute?"Update":"Add"}</Button>
        </form>
    </Form>
}

export default AttributeForm