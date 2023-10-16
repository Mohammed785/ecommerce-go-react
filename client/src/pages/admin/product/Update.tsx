import { axiosClient } from "@/axiosClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Loader2Icon, Trash2Icon,XCircleIcon,RedoIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef,useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import * as z from "zod"
import { CategoryType } from "@/context/CategoryContext"
import { cn } from "@/lib/utils";
import { ProductAttribute, ProductCategory } from "@/context/ProductsContext";


const formSchema = z.object({
    product: z.object({
        name: z.string().max(255),
        sku: z.string().length(12),
        price: z.coerce.number().min(0),
        description: z.string(),
        stock: z.coerce.number().min(1, { message: "Minimum stock allowed is 1" }),
        categoryId: z.string({ required_error: "Please choose a category for the product" })
    }),
    attributes: z.array(z.object({ attributeId: z.number(), valueId: z.number() }))
        .min(1, "Product should have at least one attribute").refine(attrs => new Set(attrs.map(attr => attr.attributeId)).size === attrs.length, {
            message: "You can't add duplicate attributes"
        })
})

type ProductImageT = {
    id: number,
    name: string,
    isPrimary: boolean
}

type ImagesState = {
    current:ProductImageT[],
    toDelete:number[],
    toUpload:{files:FileList|null,urls:string[]},
    primary: { url?: string, name?: string,isNew:boolean },
    isDirty:boolean
}

type AttributeWithValue = {
    id: number,
    name: string,
    values: {
        id: number,
        value: string
    }[]
}

type Attribute = { attributeId: number, valueId: number }

type State = {
    categories: CategoryType[]
    attributes: AttributeWithValue[]
    toAddAttributes: Attribute[]
    toDeleteAttributes:number[]
    currentAttrVal: Partial<Attribute>
    oldCategoryId:number
    loading: boolean

}
const formDefault = {
    product: {
        name: "", sku: "", price: 0, stock: 0, description: "",categoryId:undefined
    },
    attributes: []
}

function ProductUpdate(){
    const form = useForm<z.infer<typeof formSchema>>({resolver:zodResolver(formSchema),defaultValues:formDefault,shouldUnregister:false})
    const [categoriesAttributes, setCategoriesAttributes] = useState<State>({ attributes: [], categories: [], currentAttrVal: {},toDeleteAttributes:[],toAddAttributes:[], oldCategoryId:-1,loading: false })
    const [images,setImages] = useState<ImagesState>({current:[],toUpload:{files:null,urls:[]},toDelete:[],primary:{name:"",url:"",isNew:false},isDirty:false})
    const {productId} = useParams()
    const {toast} = useToast()
    const filesRef = useRef<HTMLInputElement>(null)
    
    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        const dirtyValues:Record<string,any> = {}
        let changedCategory=false;
        for(const [key,value] of Object.entries(values)){
            if(key==="attributes")continue
            for(const [k,v] of Object.entries(value)){
                const fieldState = form.getFieldState(`product.${k}` as any)
                if(fieldState.isDirty){
                    if(k==="categoryId"&&v===categoriesAttributes.oldCategoryId.toString()){
                        changedCategory=true;
                    }
                    dirtyValues[k] = k==="categoryId"?parseInt(v):v;
                }
            }
        }
        try {
            setCategoriesAttributes({...categoriesAttributes,loading:true})
            // product info
            let tempState = {...categoriesAttributes}
            let response = await axiosClient.put(`/product/${productId}`,dirtyValues)
            if(!changedCategory){ // to delete attribute
                response = categoriesAttributes.toDeleteAttributes.length>0?await axiosClient.delete(`/product/${productId}/attributes`, { data:{attributes:categoriesAttributes.toDeleteAttributes }}):response
            }else{
                tempState = { ...tempState, oldCategoryId: dirtyValues["categoryId"] }
            }
            // to add attribute
            if(categoriesAttributes.toAddAttributes.length>0){
                response = await axiosClient.post(`/product/${productId}/attributes`, { attributes:categoriesAttributes.toAddAttributes})
            }
            form.setValue(
                "attributes"
                ,form.getValues("attributes").filter(attr=>!tempState.toDeleteAttributes.find(del=>attr.attributeId===del)).concat(categoriesAttributes.toAddAttributes)
                ,{shouldDirty:false,shouldValidate:true}
            )
            tempState = {
                ...tempState,
                currentAttrVal:{attributeId:undefined,valueId:undefined},
                loading:false,
                toDeleteAttributes:[],
                toAddAttributes:[],
            }
            setCategoriesAttributes(tempState)
        } catch (error) {
            console.error(error);
            if(error instanceof AxiosError){
                if (error.response?.data.code === "VALIDATION") {
                    for (const [k, v] of Object.entries(error.response.data.details)) {
                        form.setError(k as any, { message: v as string })
                    }
                    toast({description:"Please check all your entered data",variant:"destructive"})
                } else if (error.response?.data.code === "UNIQUE_CONSTRAINT") {
                    form.setError("product.sku", { message: "Already Exists" })
                } else{
                    toast({description:error.response?.data.message,variant:"destructive"})
                }
            } 
        }
    }
    const imagesSubmit = async()=>{
        try{
            if(images.current.length-images.toDelete.length+(images.toUpload.files?.length||0)!==4){
                toast({variant:"destructive",description:"At least 4 images should be provided"})
                return 
            }
            if(images.toDelete.length>0){
                await axiosClient.delete(`/product/images/${productId}`,{data:{ids:images.toDelete}})
            }
            if(images.toUpload.files&&images.toUpload.files.length>0){
                let imagesData = new FormData()

                for (let i = 0; i < images.toUpload.files.length; i++) {
                    const img = images.toUpload.files.item(i)
                    imagesData.append("image", img!)
                    imagesData.append("primary", img?.name === images.primary.name ? "1" : "0")
                }
                await axiosClient.post(`/product/images/${productId}`,imagesData)
            }
            if(images.primary.isNew){
                const img = images.current.find(img=>img.name===images.primary.name)
                img && await axiosClient.put(`/product/images/${productId}/image/${img.id}`)
            }
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError){
                toast({description:error.response?.data.message,variant:"destructive"})
            }
        }
    }

    const loadCategories = async () => {
        try {
            const response = await axiosClient.get("/category/?subs")
            setCategoriesAttributes((prev)=>({ ...prev, categories: response.data.categories }))
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                toast({ description: error.response?.data.message })
            }
        }
    }
    const loadAttributes = async () => {
        const categoryId = form.getValues("product.categoryId")
        if (!categoryId) {
            return
        }
        try {
            const response = await axiosClient.get(`/category/${categoryId}/attributes`)
            setCategoriesAttributes((prev)=>({ ...prev, attributes: Object.values(response.data.attributes) }))
        } catch (error) {
            if (error instanceof AxiosError) {
                toast({ description: error.response?.data.message })
            }
        }
    }
    const loadProduct = async()=>{
        try {
            const response = await axiosClient.get(`/product/${productId}`)
            for(const [k,v] of Object.entries(response.data.product)){
                if(k==="category"){
                    const id = (v as ProductCategory).id
                    form.setValue("product.categoryId", id.toString(),{shouldValidate:true})
                    setCategoriesAttributes((prev)=>({...prev,oldCategoryId:id}))
                }else if(k==="attributes"){
                    form.setValue("attributes", (v as ProductAttribute[]).map((attr:any) => ({ attributeId: attr.attributeId ,valueId:attr.valueId})))
                }else if(k==="images"){
                    const primary = (v as any).find((img:any)=>(img.isPrimary))
                    setImages({...images,current:(v as any),primary:{isNew:false,name:primary.name,url:`http://localhost:8000/static/${primary.name}`}})
                }else{
                    form.setValue(`product.${k}`as any,v)
                }
            }
        } catch (error) {
            if(error instanceof AxiosError){
                toast({description:error.response?.data.message,variant:"destructive"})
            }
            console.error(error);
        }
    }
    const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const imagesFiles = e.currentTarget.files
        if (imagesFiles && imagesFiles.length > 4) {
            return toast({ variant: "destructive", description: "You can only upload maximum of 4 images" })
        }
        if(imagesFiles && (imagesFiles.length+images.current.length-images.toDelete.length)>4){
            return toast({ variant: "destructive", description: `You can't upload only ${4 - images.current.length + images.toDelete.length} more images`})
        }
        for (const img of images.toUpload.urls) {
            URL.revokeObjectURL(img)
        }
        const imagesUrls = []
        for (const img of imagesFiles || []) {
            imagesUrls.push(URL.createObjectURL(img))
        }
        const oldPrimary = images.current.find(img=>img.isPrimary===true)
        setImages({ ...images,isDirty:true, toUpload: { files: imagesFiles, urls: imagesUrls }, primary: { url: `http://localhost:8000/static/${oldPrimary?.name}`, name: oldPrimary?.name,isNew:false } })
    }
    useEffect(()=>{
        loadCategories().then(()=>{
            loadProduct().then(()=>{
                loadAttributes()
            })
        })
    },[])
    return <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="lg:col-gap-12 xl:col-gap-16 mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-5 lg:gap-16">
                        <div className="lg:col-span-3 lg:row-end-1">
                            <div className="lg:flex lg:items-start">
                                <div className="lg:order-2 lg:ml-5">
                                    <div className="max-w-full overflow-hidden rounded-lg cursor-pointer">
                                        <input ref={filesRef} max={4} onChange={handleImagesChange} type="file" className="hidden" multiple />
                                        <img className="h-full w-full max-w-full object-cover aspect-square" src={images.primary.url} alt="main-thumbnail" />
                                    </div>
                                    <p className="text-center text-muted-foreground text-sm mt-2">Click to choose images</p>
                                </div>

                                <div className="mt-2 w-full lg:order-1 lg:w-32 lg:flex-shrink-0">
                                    <RadioGroup value={images.primary.name} className="flex flex-row items-start lg:flex-col">
                                        {
                                            images.current.filter(img=>(
                                                !images.toDelete.find((i)=>(i===img.id))
                                            )).map(img=>{
                                                const url = `http://localhost:8000/static/${img.name}`
                                                return <div key={img.id} className="flex flex-1 mb-3 cursor-pointer relative">
                                                    <RadioGroupItem className="hidden" value={img.name} />
                                                    <div className={cn("flex-0 aspect-square overflow-hidden rounded-lg border-2 text-center", images.primary.name === img.name ? "border-foreground" : "border-transparent")}>
                                                        <img onClick={(_) => { setImages({ ...images, primary: { name: img.name, url,isNew:images.current.find((i)=>(i.isPrimary))?.name!==img.name },isDirty:true })}} className="h-full w-full object-cover" src={url} alt="thumbnail" />
                                                    </div>
                                                    <XCircleIcon onClick={()=>{
                                                        setImages({...images,toDelete:[...images.toDelete,img.id]})
                                                    }} className="h-5 w-5 absolute dark:text-red-700 text-red-500 -right-1 -top-1 z-10 hover:scale-110 transition-all" />
                                                </div>
                                            })
                                        }
                                        {
                                            images.toUpload.urls.map((url, idx) => {
                                                let image = images.toUpload.files?.item(idx);
                                                return <div key={url} className="flex mb-3 cursor-pointer">
                                                    <RadioGroupItem className="hidden" value={image?.name || ""} />
                                                    <div className={cn("flex-0 aspect-square overflow-hidden rounded-lg border-2 text-center", images.primary.name === image?.name ? "border-foreground" : "border-transparent")}>
                                                        <img onClick={(_) => { setImages({ ...images, primary: { name: image?.name, url, isNew: true }, isDirty: true }) }} className="h-full w-full object-cover" src={url} alt="thumbnail" />
                                                    </div>
                                                    <XCircleIcon onClick={()=>{
                                                    }} className="h-5 w-5 absolute dark:text-red-700 text-red-500 -right-1 -top-1 z-10 hover:scale-110 transition-all" />
                                                </div>
                                            })
                                        }
                                        {
                                            new Array(4-images.current.length+images.toDelete.length -images.toUpload.urls.length).fill(0).map((_, i) => (
                                                <div key={i} className="flex items-center justify-center w-32 relative" onClick={()=>{filesRef.current?.click()}}>
                                                    <label htmlFor={`dropzone-file-${i}`} className="flex flex-col items-center p-3 justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                                        <div className="flex flex-col items-center justify-center ">
                                                            <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                                            </svg>
                                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Upload image</p>
                                                        </div>
                                                    </label>
                                                    <RedoIcon onClick={(e)=>{
                                                        e.stopPropagation()
                                                        const toDelete = images.toDelete.filter((_, idx) => idx != i)             
                                                        setImages({...images,toDelete})
                                                    }} className="h-7 w-7 absolute cursor-pointer dark:text-green-700 text-green-500 -right-1 -top-2 z-10 hover:scale-110 transition-all" />
                                                </div>
                                            ))
                                        }
                                    </RadioGroup>
                                    <p className="mt-4 text-xs text-muted-foreground text-center">click to choose primary</p>
                                    
                                </div>
                            </div>
                            {
                                images.isDirty&&<div className="flex w-full mt-4">
                                <Button type="button" onClick={(e)=>{
                                    e.stopPropagation()
                                    imagesSubmit()
                                }} className="flex-1 mr-2">Save Changes</Button>
                                <Button className="flex-1 ml-2" variant="destructive" type="button" onClick={(e)=>{
                                    e.stopPropagation()
                                    const oldPrimary = images.current.find((img: any) => (img.isPrimary))
                                    setImages({ ...images, toDelete: [], toUpload: { urls: [], files: null }, primary: { isNew: false, name: oldPrimary?.name, url:`http://localhost:8000/static/${oldPrimary?.name}`},isDirty:false})
                                }}>Reset Changes</Button>
                            </div>
                            }
                        </div>

                        <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
                            <div className="mt-8 flex flex-col items-start space-y-6">
                                <FormField
                                    control={form.control}
                                    name="product.name"
                                    render={({ field }) => (
                                        <FormItem className="w-full flex flex-col space-y-1">
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Enter product name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="product.sku" render={({ field }) => (

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter SKU" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.price" render={({ field }) => (

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter Price" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.stock" render={({ field }) => (

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Available Units</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter Available Units" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.categoryId" render={({ field }) => (
                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Select {...field} onValueChange={(e) => {
                                                    if(e!==categoriesAttributes.oldCategoryId.toString()){
                                                        setCategoriesAttributes({...categoriesAttributes,toDeleteAttributes:[...categoriesAttributes.attributes.map(attr=>attr.id)]})
                                                    }else{
                                                        setCategoriesAttributes({...categoriesAttributes,toDeleteAttributes:[]})
                                                    }
                                                    field.onChange(e)
                                                    loadAttributes()
                                                }}>
                                                <SelectTrigger><SelectValue placeholder="Choose Category" /></SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        categoriesAttributes.categories.map((cat) => (
                                                            <SelectGroup key={cat.id}>
                                                                <SelectLabel className="px-6 text-sm leading-6 text-gray-400 dark:text-gray-500">{cat.name}</SelectLabel>
                                                                <SelectItem value={`${cat.id}`}>{cat.name}</SelectItem>
                                                                {
                                                                    cat.subs?.map(sub => (
                                                                        <SelectItem key={sub.id} value={`${sub.id}`}>{sub.name}</SelectItem>
                                                                    ))
                                                                }
                                                                <SelectSeparator />
                                                            </SelectGroup>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormDescription className="text-xs text-red-500 dark:text-red-700">Note: changing category will delete all related attributes</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField control={form.control} name="product.description" render={({ field }) => (

                                    <FormItem className="w-full flex flex-col space-y-1">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <textarea {...field} placeholder="Enter Description" className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" onClick={() => { const id = form.getValues("product.categoryId") }} disabled={categoriesAttributes.loading} className="w-full">
                                    {
                                        categoriesAttributes.loading && <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                                    }
                                    Update Product
                                </Button>
                            </div>
                        </div>
                        <div className="lg:col-span-3 space-y-4">
                            <Table>
                                <TableCaption>Selected product attributes</TableCaption>
                                <TableBody>
                                    {
                                        form.getValues("attributes")?.filter(attr=>!categoriesAttributes.toDeleteAttributes.find(del=>del===attr.attributeId)).concat(categoriesAttributes.toAddAttributes).map(value => {
                                            let attribute = categoriesAttributes.attributes.find(attr => attr.id === value.attributeId)
                                            return <TableRow key={value.valueId}>
                                                <TableCell>{attribute?.name}</TableCell>
                                                <TableCell>{attribute?.values.find(val => val.id === value.valueId)?.value}</TableCell>
                                                <TableCell>
                                                    <Trash2Icon onClick={() => {
                                                        if(categoriesAttributes.toAddAttributes.find((attr)=>attr.attributeId===value.attributeId)){
                                                            setCategoriesAttributes({...categoriesAttributes,toAddAttributes:categoriesAttributes.toAddAttributes.filter((attr)=>attr.attributeId!==value.attributeId)})
                                                        }else{
                                                            setCategoriesAttributes({...categoriesAttributes,toDeleteAttributes:[...categoriesAttributes.toDeleteAttributes,value.attributeId]})
                                                        }

                                                    }} className="cursor-pointer w-5 text-red-600 dark:text-red-800 h-5" />
                                                </TableCell>
                                            </TableRow>
                                        })
                                    }
                                </TableBody>
                            </Table>
                            <hr className="h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
                            <div className="flex flex-col">
                                <FormField control={form.control} name="attributes" render={(_) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex space-x-4">
                                                <Select value={categoriesAttributes.currentAttrVal.attributeId?.toString()} onValueChange={(e) => { setCategoriesAttributes({ ...categoriesAttributes, currentAttrVal: { attributeId: parseInt(e), valueId: undefined } }) }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Attribute" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {
                                                            categoriesAttributes.attributes.map(attr => (
                                                                <SelectItem key={attr.id} value={`${attr.id}`}>{attr.name}</SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>

                                                <Select value={categoriesAttributes.currentAttrVal.valueId?.toString()} onValueChange={(value) => {
                                                    setCategoriesAttributes({ ...categoriesAttributes, currentAttrVal: { ...categoriesAttributes.currentAttrVal, valueId: parseInt(value) } })
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Value" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {
                                                            categoriesAttributes.attributes.find(attr => attr.id === categoriesAttributes.currentAttrVal.attributeId)?.values.map(val => (
                                                                <SelectItem key={val.id} value={`${val.id}`}>{val.value}</SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button className="mt-4" disabled={categoriesAttributes.loading} onClick={(e) => {
                                    e.preventDefault()
                                    if (!categoriesAttributes.currentAttrVal.attributeId || !categoriesAttributes.currentAttrVal.valueId) {
                                        toast({ description: "Please choose attribute and value before adding", variant: "destructive" })
                                    } else {
                                        const attributes = form.getValues("attributes").filter(attr=>(
                                            !categoriesAttributes.toDeleteAttributes.find(toDelete=>toDelete===attr.attributeId)
                                        )).concat(categoriesAttributes.toAddAttributes)
                                        const exists = attributes.find(attr=>attr.attributeId===categoriesAttributes.currentAttrVal.attributeId)
                                        if (exists) {
                                            return toast({ variant: "destructive", description: "Attribute Already exists" })
                                        }
                                        setCategoriesAttributes({ ...categoriesAttributes, toAddAttributes: [...categoriesAttributes.toAddAttributes, { attributeId: categoriesAttributes.currentAttrVal.attributeId, valueId: categoriesAttributes.currentAttrVal.valueId }]})
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


export default ProductUpdate;