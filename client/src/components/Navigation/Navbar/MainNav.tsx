import { cn } from "@/lib/utils"
import { Link, NavLink } from "react-router-dom"
import { mainNav,adminMenu } from "./config"
import useAuthContext from "@/hooks/useAuthContext"
import {NavigationMenu,NavigationMenuContent,NavigationMenuItem,NavigationMenuLink,NavigationMenuList,NavigationMenuTrigger,navigationMenuTriggerStyle} from "@/components/ui/navigation-menu"
import useCategoryContext from "@/hooks/useCategoryContext"
import { SubCategoryType } from "@/context/CategoryContext"


function MainNav({className,...props}:React.HTMLAttributes<HTMLElement>){
    const baseClass = "text-sm font-medium transition-colors hover:text-primary"
    const { user } = useAuthContext()
    const { categories } = useCategoryContext()
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
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                {
                                    categories.map((cat) => (
                                        <ListItem key={cat.id} to={`/products?cid=${cat.id}&cname=${cat.name}`} title={cat.name} subs={cat.subs} />
                                    ))
                                }
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                        <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:[500px] md:grid-cols-2 lg:w-[600px]">
                                    {
                                        adminMenu.map(menu=>(
                                            <li key={menu.to}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        to={menu.to}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-base font-medium"                                    
                                                    >
                                                        {menu.title}
                                                    </Link>
                                                </NavigationMenuLink>
                                                <hr className="my-1 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
                                                <ul>
                                                    {menu.subs.map(sub=>(
                                                        <li key={sub.to}>
                                                            <Link className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-base font-medium capitalize" 
                                                            to={sub.to}>
                                                                {sub.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </li>
                                        ))
                                    }
                                </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    )
}
function ListItem({to,title,subs}:{to:string,title:string,subs:SubCategoryType[]|null}){
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    to={to}
                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-base font-medium"
                >
                    {title}
                </Link>
            </NavigationMenuLink>
            <hr className="my-1 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
            <ul>
                {subs&&subs.map(sub=>(
                    <li key={sub.id}>
                        <Link className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-base font-medium capitalize" 
                        to={`${to}&sid=${sub.id}&sname=${sub.name}`}>
                            {sub.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    )
}

ListItem.displayName = "ListItem"

export default MainNav