import { Button } from "@/components/ui/button";
import { Sheet,SheetTrigger,SheetContent } from "@/components/ui/sheet";
import { RxViewVertical } from "react-icons/rx";
import { ShoppingCart } from "lucide-react"
import { useState } from "react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mainNav } from "./config";
import useCategoryContext from "@/hooks/useCategoryContext";

function MobileNav(){
    const [open,setOpen] = useState(false)
    const { categories } = useCategoryContext()
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button value="ghost" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                    <RxViewVertical className="h-5 w-5"/>
                    
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <Link to="/" className="flex items-center" onClick={()=>setOpen(false)}>
                    <ShoppingCart className="mr-2 h-4 w-4"/>
                    <span className="font-bold">Ecommerce</span>
                </Link>
                <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                        {
                            mainNav.map((link,i)=>{
                                return <Link key={i} to={link.to} onClick={()=>setOpen(false)}>
                                    {link.title}
                                </Link>
                            })
                        }
                    </div>
                    <div className="flex flex-col space-y-2">
                        {
                            categories.map((cat)=>(
                                <div key={cat.id} className="flex flex-col space-y-3 pt-6">
                                    <h5 className="font-medium">{cat.name}</h5>
                                    {cat.subs && cat.subs.map((sub) => (
                                        <Link key={sub.id} to={`/products?cid=${cat.id}&cname=${cat.name}&sid=${sub.id}&sname=${sub.name}`} className="text-muted-foreground">
                                            {sub.name}
                                        </Link>
                                    ))
                                    }
                                </div>
                            ))
                        }
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    ) 
}
export default MobileNav