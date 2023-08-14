import { axiosClient } from "@/axiosClient";
import { ReactNode, createContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast"

type User = {
    id:number,
    isAdmin:boolean
}

type AuthContextType = {
    user:User|undefined
    login:(user:User)=>void,
    logout:()=>void
}

const defaultContext:AuthContextType = {
    user:undefined,
    login(_) {},
    logout() { }
}

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({children}:{children:ReactNode}){
    const [user, setUser] = useState<User|undefined>(undefined)
    const { toast } = useToast()

    const login = (user:User)=>{
        setUser(user)
    }
    const logout = async()=>{
        try {
            await axiosClient.post("/auth/logout")
            setUser(undefined)
        } catch (error) {
            toast({title:"Something went wrong",description:"Logout failed please try again"})
        }
    }
    return <AuthContext.Provider value={{user,login,logout}}>
        {children}
    </AuthContext.Provider>
}
