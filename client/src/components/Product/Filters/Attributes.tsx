import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import Select from "@/components/Select"
import { MultiValue } from "react-select"
import { useToast } from "@/components/ui/use-toast"
import useProductContext from "@/hooks/useProductContext"

type AttributeType = {
    id:number,
    name:string,
    values:{id:number,value:string}[]
}

function Attributes(){
    const [attributes,setAttributes] = useState<AttributeType[]>([])
    const { filters,setFilters } = useProductContext()
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
        setFilters({ ...filters, attributeValues: { ...filters.attributeValues,[attributeId]:value}})
    }
    useEffect(()=>{
        setFilters({ ...filters, attributeValues:null})
        loadAttributes()
    },[searchParams.get("sid")])
    return <>
    
    {
        attributes.map((attr)=>{
            const options = attr.values.map((val)=>({label:val.value,value:val.id}));
            return <Select placeholder={`Select ${attr.name}`} key={attr.id} isMulti options={options} value={filters.attributeValues?filters.attributeValues[attr.id]:""} onChange={(value)=>onChange(attr.id,value)}/>
        })
    }
    </>
}

export default Attributes