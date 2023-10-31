import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MouseEvent } from "react";
import { ProductSearch } from "@/context/ProductsContext";

function ProductCard({product}:{product:ProductSearch}){
    const addToCart = (e:MouseEvent<HTMLButtonElement,globalThis.MouseEvent>)=>{
        e.preventDefault()
        // TODO:
    }
    return <div className="w-72 lg:w-64 shadow-md rounded-xl duration-500 dark:shadow-neutral-900 hover:shadow-xl">
            <Link className="h-full" to={`/product/${product.id}`}> 
            <img className="h-60 w-72 lg:w-64 object-cover rounded-t-xl transition duration-300 ease-in-out hover:scale-105" src={`http://localhost:8000/static/${product.image}`} alt=""/>                
            <div className="px-4 py-3 min-h-fit w-72 lg:w-64 bg-accent rounded-b-xl">
                    {/* <span className="text-gray-400 mr-3 uppercase text-xs">Brand</span> */}
                    <p className="text-lg font-bold text-foreground block capitalize">{product.name}</p>
                    <div className="flex items-center">
                        <p className="text-lg font-semibold text-foreground cursor-auto my-3">${product.price}</p>
                        {/* <del>
                            <p className="text-sm text-muted-foreground cursor-auto ml-2">$199</p>
                        </del> */}
                        <div className="ml-auto">
                            <Button variant="outline" size="icon" onClick={addToCart}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                fill="currentColor" className="bi bi-bag-plus" viewBox="0 0 16 16">
                                <path fill-rule="evenodd"
                                    d="M8 7.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0v-1.5H6a.5.5 0 0 1 0-1h1.5V8a.5.5 0 0 1 .5-.5z" />
                                <path
                                    d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
}

export default ProductCard;