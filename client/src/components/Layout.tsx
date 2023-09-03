import { useEffect } from "react"
import SiteHeader from "./Navigation/SiteHeader"

type RootLayoutProps = {
    children:React.ReactNode
}

function RootLayout({children}:RootLayoutProps){
    useEffect(() => {
        document.body.classList.add("min-h-screen", "bg-background", "antialiased")
    })
    return <>
        <div className="relative min-h-screen flex flex-col">
            <SiteHeader/>
            <div className="flex-1">
                {children}
            </div>
        </div>
    </>
}

export default RootLayout