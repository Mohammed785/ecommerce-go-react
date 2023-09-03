import useAuthContext from "@/hooks/useAuthContext"
import MainNav from "./Navbar/MainNav"
import MobileNav from "./Navbar/MobileNav"
import SearchBar from "./SearchBar/SearchBar"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils";
import { DropdownMenu,DropdownMenuItem,DropdownMenuTrigger,DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button";
import { UserPlus,LogIn,UserCircle } from "lucide-react";
import ModeToggle from "./ModeToggle";
import { Avatar, AvatarFallback } from "../ui/avatar";

function SiteHeader(){
    const { user,logout } = useAuthContext()
    return (
        <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-14 items-center">
                <MainNav className="hidden md:flex"/>
                <MobileNav/>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <SearchBar/>
                    </div>
                    <nav className="flex items-center">
                    {
                        user?<DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback asChild>
                                            <UserCircle/>
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link to="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/bookmarks">Bookmarks</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem onClick={()=>logout()}>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        :(<>
                        <Link to="/Login">
                            <div className={cn(buttonVariants({variant:"ghost"}),"w-9 px-0")}>
                                <LogIn className="h-4 w-4"/>
                                <span className="sr-only">Login</span>
                            </div>
                        </Link>
                        <Link to="/Register">
                            <div className={cn(buttonVariants({variant:"ghost"}),"w-9 px-0")}>
                                <UserPlus className="h-4 w-4"/>
                                <span className="sr-only">Register</span>
                            </div>
                        </Link>
                                </>)
                    }
                    <ModeToggle/>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default SiteHeader;