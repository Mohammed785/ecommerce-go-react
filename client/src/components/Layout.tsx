import { useEffect } from "react"
import SiteHeader from "./Navigation/SiteHeader"
import { Outlet } from "react-router-dom"
import { CategoryProvider } from "@/context/CategoryContext"



function RootLayout(){
    useEffect(() => {
        document.body.classList.add("min-h-screen", "bg-background", "antialiased")
    })
    return <>
    <CategoryProvider>
        <div className="relative min-h-screen flex flex-col">
            <SiteHeader/>
            <div className="flex-1">
                <Outlet/>
            </div>
        </div>
    </CategoryProvider>
    </>
}

export default RootLayout