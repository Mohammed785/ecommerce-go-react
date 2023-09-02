import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"
import { mainNav } from "./config"
import useAuthContext from "@/hooks/useAuthContext"


function MainNav({className,...props}:React.HTMLAttributes<HTMLElement>){
    const baseClass = "text-sm font-medium transition-colors hover:text-primary"
    const { user } = useAuthContext()
    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-6",className)} {...props}>
            {
                mainNav.map((link,i)=>{
                    if(link.admin&&!user?.isAdmin){
                        return ""
                    }
                    return <NavLink key={i} to={link.to} end={link.end} className={({isActive})=>{
                        return isActive?baseClass:cn(baseClass,"text-muted-foreground")
                    }}>
                        {link.title}
                    </NavLink>
                })
            }
        </nav>
    )
}

export default MainNav