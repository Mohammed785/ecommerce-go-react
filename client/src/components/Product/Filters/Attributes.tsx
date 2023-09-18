import { axiosClient } from "@/axiosClient"
import { AxiosError } from "axios"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import Select from "@/components/Select"
import { MultiValue } from "react-select"

type AttributeType = {
    id:number,
    name:string,
    values:{id:number,value:string}[]
}

const Attributes = forwardRef((_,_ref)=>{
    const [attributes,setAttributes] = useState<AttributeType[]>([])
    const [values,setValues] = useState<Record<string,any>>({})
    const searchParams = new URLSearchParams(window.location.href)
    const loadAttributes = async()=>{
        try {
            const response = await axiosClient.get(`/category/${searchParams.get("sid")}/attributes`)
            setAttributes(Object.values(response.data.attributes)||[])
        } catch (error) {
            if(error instanceof AxiosError){

            }
        }
    }
    const onChange = (attributeId:number,value:MultiValue<{value:number,label:string}>)=>{
        setValues({...values,[attributeId]:value})
    }
    useEffect(()=>{
        loadAttributes()
    },[searchParams.get("sid")])
    useImperativeHandle(_ref,()=>({
        getValues:()=>{
            return values
        }
    }))
    return <>
    <h2 className="text-center font-bold text-lg">Attributes</h2>
    <hr className="my-1 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
    {
        attributes.map((attr)=>{
            const options = attr.values.map((val)=>({label:val.value,value:val.id}));
            return <Select placeholder={`Select ${attr.name}`} key={attr.id} isMulti options={options} value={values[attr.id]} onChange={(value)=>onChange(attr.id,value)}/>
        })
    }
    </>
})

export default Attributes