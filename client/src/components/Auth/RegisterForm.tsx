import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useState } from "react";
import { axiosClient } from "@/axiosClient";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
    firstName: z.string().min(2, { message: "first name must contain at least 2 characters" }).max(25, { message:"first name must contain at most 25 characters"}),
    lastName: z.string().min(2, { message: "last name must contain at least 2 characters" }).max(25, { message:"last name must contain at most 25 characters"}),
    email: z.string({required_error:"Email is required"}).email(),
    password: z.string().min(8, { message: "password must contain at least 8 characters" }).max(30, { message: "password must contain at most 30 characters" }),
    dob: z.date({required_error: "Your date of birth is required to calculate your age."})
})

function RegisterForm(){
    const [loading,setLoading] = useState(false)
    const { toast } = useToast()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            firstName:"",lastName:"",email:"",password:"",dob:undefined
        }
    })
    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        setLoading(true)
        try {
            await axiosClient.post("/auth/register",{...values,dob:values.dob.toLocaleDateString()})
            toast({description:"Account created successfully"})
            setLoading(false)
        } catch (error) {
            if(error instanceof AxiosError){
                if (error.response?.data.code === "UNIQUE_CONSTRAINT"){
                    form.setError("email",{message:"Email already exists"})
                }else if(error.response?.data.code==="VALIDATION"){
                    console.error(error.response?.data.details)
                    for(const [field,err] of Object.entries(error.response?.data.details)){
                        form.setError(field as any,{message:err as string})
                    }
                }else{
                    toast({description:error.response?.data.message,variant:"destructive"})
                }
                setLoading(false)
            }
        }
    }
    return <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-row w-full">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({field})=>(
                            <FormItem className="mr-2">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="First Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({field})=>(
                            <FormItem className="ml-2">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Last Name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                control={form.control}
                name="email"
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input placeholder="Email Address" {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({field})=>(
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input placeholder="Password" type="password" {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="dob"
                render={({field})=>(
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value&&"text-muted-foreground")}>
                                        {
                                            field.value?(
                                                format(field.value,"PPP")
                                            ):(
                                                <span>Pick a date</span>
                                            )
                                        }
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                captionLayout="dropdown-buttons"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date)=>date>new Date()|| date<new Date(date.getFullYear()-18,date.getMonth(),date.getDay())}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {
                        loading
                        ?<>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Please wait
                        </>
                        :"Register"
                    }
                </Button>
            </form>
        </Form>
    </>
}

export default RegisterForm;