import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import Select from "@/components/Select"
import { MultiValue } from "react-select"
import { useToast } from "@/components/ui/use-toast"

type AttributeType = {
    id:number,
    name:string,
    values:{id:number,value:string}[]
}

const Attributes = forwardRef((_,_ref)=>{
    const [attributes,setAttributes] = useState<AttributeType[]>([])
    const [values,setValues] = useState<Record<string,any>|null>({})
    const searchParams = new URLSearchParams(window.location.href)
    const {toast} = useToast()
    const loadAttributes = async()=>{
        try {
            const response = await axiosClient.get(`/category/${searchParams.get("sid")}/attributes`)
            setAttributes(Object.values(response.data.attributes)||[])
        } catch (error) {
            if(error instanceof AxiosError){
                toast({variant:"destructive",description:error.response?.data.message})
            }
        }
    }
    const onChange = (attributeId:number,value:MultiValue<{value:number,label:string}>)=>{
        setValues({...values,[attributeId]:value})
    }
    useEffect(()=>{
        setValues(null)
        loadAttributes()
    },[searchParams.get("sid")])
    useImperativeHandle(_ref,()=>({
        getValues:()=>{
            return values
        }
    }))
    return <>
    
    {
        attributes.map((attr)=>{
            const options = attr.values.map((val)=>({label:val.value,value:val.id}));
            return <Select placeholder={`Select ${attr.name}`} key={attr.id} isMulti options={options} value={values?values[attr.id]:""} onChange={(value)=>onChange(attr.id,value)}/>
        })
    }
    </>
})

export default Attributes