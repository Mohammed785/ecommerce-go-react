import useAuthContext from "@/hooks/useAuthContext";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

function AdminRequired({children}:{children:ReactNode}){
    const {user} = useAuthContext()
    const navigate = useNavigate()
    if(!user||!user.isAdmin){
        navigate("/",{replace:true})
        return <></>
    }
    return <>
        {children}
    </>
}

export default AdminRequired