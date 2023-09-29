import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import useAuthContext from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import { axiosClient } from "@/axiosClient";
import axios from "axios";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "password must be at least 8 characters" }).max(30, { message:"password must contain at most 25 characters"})
})

function LoginForm(){
    const [loading,setLoading] = useState(false);
    const { toast } = useToast()
    const { login } = useAuthContext()
    const navigate = useNavigate()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues:{
            email:"",
            password:""
        }
    })
    const onSubmit = async(values: z.infer<typeof formSchema>)=>{
        setLoading(true)
        try {
            const response = await axiosClient.post("/auth/login",values);
            login(response.data.user);
            navigate("/",{replace:true})
        } catch (error) {
            if(error instanceof axios.AxiosError){
                if (error.response?.data.code ==="WRONG_CREDENTIALS"){
                    toast({title:"Wrong Credentials",description:"Check your email and password and try again"})
                }else if (error.response?.data.code === "VALIDATION"){
                    for(const [k,v] of Object.entries(error.response.data.details)){
                        form.setError(k as "email"|"password",{message:v as string})
                    }
                }else{
                    toast({title:"Server Error",description:"Something went wrong could you try again"})
                }
            }
            setLoading(false)
        }
    }
    return <>
    
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <Input type="password" placeholder="Password" {...field}/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <Button type="submit" disabled={loading} className="w-full">
                {
                    loading?<>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Please wait
                    </>
                    :"Login"
                }
            </Button>
        </form>
    </Form>
    </>
}

export default LoginForm