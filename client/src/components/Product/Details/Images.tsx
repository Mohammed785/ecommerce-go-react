import { ProductImage } from "@/context/ProductsContext"
import { cn } from "@/lib/utils"
import { useState } from "react"

function ProductImages({images}:{images:ProductImage[]}){
    const [selected,setSelected] = useState(images.find((img)=>img.isPrimary))
    return <div className="lg:col-span-3 lg:row-end-1">
        <div className="lg:flex lg:items-start">
            <div className="lg:order-2 lg:ml-5">
                <div className="max-w-full overflow-hidden rounded-lg">
                    {
                        <img className="h-full w-full max-w-full object-cover" src={`http://localhost:8000/static/${selected?.name}`} alt="main-thumbnail" />
                    }
                </div>
            </div>

            <div className="mt-2 w-full lg:order-1 lg:w-32 lg:flex-shrink-0">
                <div className="flex flex-row items-start lg:flex-col">
                    {
                        images.map(img=>(
                            <button key={img.id} type="button" onClick={()=>{setSelected(img)}} className={cn("flex-0 aspect-square mb-3 overflow-hidden rounded-lg border-2 text-center", img.id === selected?.id ? "border-foreground" : "border-transparent") }>
                                <img className="h-full w-full object-cover" src={`http://localhost:8000/static/${img.name}`} alt="thumbnail" />
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    </div>
}

export default ProductImages