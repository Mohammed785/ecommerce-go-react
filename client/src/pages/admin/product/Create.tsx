import { axiosClient } from "@/axiosClient"
import { Button } from "@/components/ui/button"
import { Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectGroup, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectItem } from "@/components/ui/select"
import { SelectContent } from "@/components/ui/select"
import { Select } from "@/components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { CategoryType } from "@/context/CategoryContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2Icon } from "lucide-react"

const formSchema = z.object({
    product:z.object({
        name: z.string({ required_error: "Name is required" }).min(1, { message: "Name is required" }).max(255),
        sku:z.string().length(12),
        price:z.coerce.number().min(0),
        description:z.string({required_error:"Description is required"}).min(1,{message:"Description is required"}),
        stock:z.coerce.number().min(1,{message:"Minimum stock allowed is 1"}),
        categoryId:z.number({required_error:"Please choose a category for the product"})
    }),
    attributes: z.array(z.object({ attributeId: z.number(), valueId: z.number() }))
    .min(1, "Product should have at least one attribute")
    .refine(items => new Set(items.map(i=>i.attributeId)).size === items.length, {
        message: "You can't add duplicate attributes",
    })
}) 

const formDefault = {
    product:{
        name:"",sku:"",price:0,stock:0,description:""
    },
    attributes:[]
}

type AttributeWithValue = {
    id:number,
    name:string,
    values:{
        id:number,
        value:string
    }[]
}

type State = {
    categories:CategoryType[],
    attributes:AttributeWithValue[],
    currentAttrVal:{attributeId?:number,valueId?:number}
    loading:boolean
}

type ImagesState = {
    imagesUrls:string[],
    imagesFiles:FileList|null
    primary:{url?:string,name?:string},
}

function ProductCreate(){
    const form = useForm<z.infer<typeof formSchema>>({resolver:zodResolver(formSchema),defaultValues:formDefault})
    const [images,setImages] = useState<ImagesState>({imagesUrls:[],imagesFiles:null,primary:{url:"",name:""}})
    const [state,setState] = useState<State>({attributes:[],categories:[],currentAttrVal:{},loading:false})
    const {toast} = useToast()
    const filesRef = useRef<HTMLInputElement>(null)
    const productIdRef = useRef<number|null>(null)
    const loadCategories = async()=>{
        try {
            const response = await axiosClient.get("/category/?subs")
            setState({...state,categories:response.data.categories})
        } catch (error) {
            console.error(error);
            if(error instanceof AxiosError){
                toast({description:error.response?.data.message})
            }
        }
    }
    const loadAttributes = async()=>{
        if(!form.getValues("product.categoryId")){
            return
        }
        try {
            const response = await axiosClient.get(`/category/${form.getValues("product.categoryId")}/attributes`)
            form.setValue("attributes",[])
            setState({...state,attributes:Object.values(response.data.attributes),currentAttrVal:{}})
        } catch (error) {
            if(error instanceof AxiosError){
                toast({description:error.response?.data.message})
            }
        }
    }
    useEffect(()=>{
        loadCategories()
    },[])
    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        if(!images.imagesFiles||images.imagesFiles.length!==4){
            return toast({description:"Please upload 4 product images",variant:"destructive"})
        }
        try {
            setState({...state,loading:true})
            if(!productIdRef.current){
                const response = await axiosClient.post("/product/",values)
                productIdRef.current = response.data.productId
            }
            let imagesData = new FormData()
            for (let i = 0; i < images.imagesFiles.length; i++) {
                const img = images.imagesFiles.item(i)
                imagesData.append("image",img!)
                imagesData.append("primary",img?.name===images.primary.name?"1":"0")
            }
            await axiosClient.post(`/product/images/${productIdRef.current}`,imagesData)
            toast({description:"Product created successfully"})
            form.reset()
            productIdRef.current = null
            setImages({imagesFiles:null,imagesUrls:[],primary:{}})
            setState({...state,loading:false})
        } catch (error) {
            console.error(error)
            setState({...state,loading:false})
            if(error instanceof AxiosError){
                if(error.response?.data.code==="VALIDATION"){
                    for (const [field, err] of Object.entries(error.response?.data.details)) {
                        form.setError(field as any, { message: err as string })
                    }
                }else if(error.response?.data.code==="UNIQUE_CONSTRAINT"){
                    form.setError("product.sku", { message: "Already Exists" })
                }else{
                    toast({description:error.response?.data.message,variant:"destructive"})
                }
            }
            if(productIdRef.current){
                toast({description:"Product info created successfully, but failed to upload images try to upload it again",variant:"destructive"})
            }else{
                toast({description:"Check product info and try again",variant:"destructive"})
            }
        }    
    }
    const handleImagesChange = (e:ChangeEvent<HTMLInputElement>)=>{
        const imagesFiles = e.currentTarget.files
        if(imagesFiles&&imagesFiles.length>4){
            return toast({variant:"destructive",description:"You can only upload 4 images"})
        }
        for(const img of images.imagesUrls){
            URL.revokeObjectURL(img)
        }
        const imagesUrls = []
        for(const img of imagesFiles||[]){
            imagesUrls.push(URL.createObjectURL(img))
        }
        setImages({imagesUrls,imagesFiles,primary:{url:"",name:""}})
    }
    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="lg:col-gap-12 xl:col-gap-16 mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-5 lg:gap-16">
                        <div className="lg:col-span-3 lg:row-end-1">
                            <div className="lg:flex lg:items-start">
                                <div className="lg:order-2 lg:ml-5">
                                    <div onClick={(_) => { filesRef.current?.click() }} className="max-w-xl overflow-hidden rounded-lg cursor-pointer">
                                        <Input type="file" onChange={handleImagesChange} className="hidden" multiple ref={filesRef} />
                                        {
                                            images.primary.url?<img className="h-full w-full max-w-full object-cover aspect-square" loading="lazy" src={images.primary.url} alt="main-thumbnail" />
                                            :<Skeleton className="w-[36em] h-[36em] xl:w-[36em] md:w-[30em] mx-auto"/>
                                        }
                                    </div>
                                    <p className="text-center text-muted-foreground text-sm mt-2">Primary Image (click to choose images)</p>
                                </div>

                                <div className="mt-2 w-full lg:order-1 lg:w-32 lg:flex-shrink-0">
                                    <RadioGroup value={images.primary.name} className="flex flex-row items-start lg:flex-col">
                                        {
                                            images.imagesUrls.length>0?images.imagesUrls.map((url,idx)=>{
                                                let image = images.imagesFiles?.item(idx);
                                                return <div key={url} className="flex flex-1 mb-3 cursor-pointer">
                                                    <RadioGroupItem className="hidden" value={image?.name||""}/>
                                                    <div className={cn("flex-0 aspect-square overflow-hidden rounded-lg border-2 text-center", images.primary.name === image?.name ?"border-foreground":"border-transparent")}>
                                                        <img loading="lazy" onClick={(_) => { setImages({ ...images,primary: {name:images.imagesFiles?.item(idx)?.name,url} }) }} className="h-full w-full object-cover" src={url} alt="thumbnail" />
                                                    </div>
                                                </div>
                                            }):new Array(4).fill(0).map((_,i)=>(
                                                <div key={i} className="flex mb-3 w-full relative">
                                                    <RadioGroupItem disabled className="hidden" value="2" />
                                                    <div className="flex-0 aspect-square w-full overflow-hidden rounded-lg border-2 text-center">
                                                        <Skeleton className="h-full w-full" />
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </RadioGroup>
                                    <p className="text-xs text-muted-foreground text-center">click to choose primary</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
                            <div className="mt-8 flex flex-col items-start space-y-6">
                                <FormField
                                    control={form.control}
                                    name="product.name"
                                    render={({field})=>(
                                        <FormItem className="w-full flex flex-col space-y-1">
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Enter product name" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="product.sku" render={({field})=>(

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter SKU" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.price" render={({field})=>(

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter Price" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.stock" render={({field})=>(

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Available Units</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter Available Units" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.categoryId" render={({field})=>(
                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={(e)=>{
                                                field.onChange(parseInt(e))
                                                loadAttributes()
                                            }} {...field} value={field.value?.toString()} >
                                                <SelectTrigger><SelectValue placeholder="Choose Category"/></SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        state.categories.map((cat)=>(
                                                            <SelectGroup key={cat.id}>
                                                                <SelectLabel className="px-6 text-sm leading-6 text-gray-400 dark:text-gray-500">{cat.name}</SelectLabel>
                                                                <SelectItem value={`${cat.id}`}>{cat.name}</SelectItem>
                                                                {
                                                                    cat.subs?.map(sub=>(
                                                                        <SelectItem key={sub.id} value={`${sub.id}`}>{sub.name}</SelectItem>
                                                                    ))
                                                                }
                                                            <SelectSeparator/>
                                                            </SelectGroup>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription>choose category first to load it related attributes</FormDescription>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.description" render={({field})=>(

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <textarea {...field} placeholder="Enter Description" className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" disabled={state.loading} className="w-full">
                                    {
                                        state.loading &&<Loader2Icon className="h-4 w-4 mr-2 animate-spin"/>
                                    }
                                    Create Product
                                </Button>
                                <p className="text-muted-foreground text-sm">Make sure to upload product images and choose it attributes before submit</p>
                            </div>
                        </div>
                        <div className="lg:col-span-3 space-y-4">
                            <Table>
                                <TableCaption>Selected product attributes</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Attribute</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        form.getValues("attributes")?.map(value=>{
                                            let attribute = state.attributes.find(attr => attr.id === value.attributeId)
                                            return <TableRow key={value.valueId}>
                                                <TableCell>{attribute?.name}</TableCell>
                                                <TableCell>{attribute?.values.find(val=>val.id===value.valueId)?.value}</TableCell>
                                                <TableCell>
                                                    <Trash2Icon onClick={()=>{
                                                        const attributes = form.getValues("attributes").filter((attr)=>attr.attributeId!==value.attributeId)
                                                        form.setValue("attributes",attributes,{shouldDirty:true,shouldValidate:true})
                                                    }} className="cursor-pointer w-5 text-red-600 dark:text-red-800 h-5"/>
                                                </TableCell>
                                            </TableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                            <hr className="h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
                            <div className="flex flex-col">
                                    <FormField control={form.control} name="attributes" render={(_)=>(
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex space-x-4">
                                                    <Select value={state.currentAttrVal.attributeId?.toString()} onValueChange={(e)=>{setState({...state,currentAttrVal:{attributeId:parseInt(e),valueId:undefined}})}}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Attribute"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {
                                                                state.attributes.map(attr=>(
                                                                    <SelectItem key={attr.id} value={`${attr.id}`}>{attr.name}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                    
                                                    <Select value={state.currentAttrVal.valueId?.toString()} onValueChange={(value)=>{
                                                        setState({...state,currentAttrVal:{...state.currentAttrVal,valueId:parseInt(value)}})
                                                    }}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Value"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {
                                                                state.attributes.find(attr=>attr.id===state.currentAttrVal.attributeId)?.values.map(val=>(
                                                                    <SelectItem key={val.id} value={`${val.id}`}>{val.value}</SelectItem>
                                                                ))
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                            </div>
                                                        </FormControl>
                                                    <FormMessage/>
                                        </FormItem>
                                    )}
                                    />
                                <Button className="mt-4" disabled={state.loading} onClick={(e) => {  
                                    e.preventDefault()
                                    if(!state.currentAttrVal.attributeId||!state.currentAttrVal.valueId){
                                        toast({description:"Please choose attribute and value before adding",variant:"destructive"})
                                    }else{
                                        const exists = form.getValues("attributes").find((attr)=>attr.attributeId===state.currentAttrVal.attributeId)
                                        if(exists){
                                            return toast({variant:"destructive",description:"Attribute Already exists"})
                                        }
                                        form.setValue("attributes", [...form.getValues("attributes"), { attributeId: state.currentAttrVal.attributeId, valueId:state.currentAttrVal.valueId }], { shouldValidate: true, shouldDirty: true }) 
                                    }
                                }}>Add Attribute</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </form>
    </Form>
}

export default ProductCreate