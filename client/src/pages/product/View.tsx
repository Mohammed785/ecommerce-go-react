import { axiosClient } from "@/axiosClient"
import { useEffect, useState } from "react"
import { ProductDetails } from "@/context/ProductsContext"
import ProductImages from "@/components/Product/Details/Images"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs"
import Attributes from "@/components/Product/Details/Attributes"
import { AxiosError } from "axios"
import { useParams } from "react-router-dom"

function ProductView() {
    const [product, setProduct] = useState<ProductDetails>({} as ProductDetails)
    const {productId} = useParams()
    const getProductInfo = async () => {
        try {
            const response = await axiosClient.get(`/product/${productId}`)
            setProduct(response.data.product)
        } catch (error) {
            if(error instanceof AxiosError){
                if(error.response?.status===404){
                    // TODO:
                }
            }
            console.error(error)
        }
    }
    useEffect(()=>{
        getProductInfo()
    },[])
    return (
        <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="lg:col-gap-12 xl:col-gap-16 mt-8 grid grid-cols-1 gap-12 lg:mt-12 lg:grid-cols-5 lg:gap-16">
                    <ProductImages images={product.images||[]}/>

                    <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
                        <h1 className="sm: text-2xl font-bold text-foreground sm:text-3xl">{product.name}</h1>

                        <div className="mt-5 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    <svg className="block h-4 w-4 align-middle text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className=""></path>
                                    </svg>
                                    <svg className="block h-4 w-4 align-middle text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className=""></path>
                                    </svg>
                                    <svg className="block h-4 w-4 align-middle text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className=""></path>
                                    </svg>
                                    <svg className="block h-4 w-4 align-middle text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className=""></path>
                                    </svg>
                                    <svg className="block h-4 w-4 align-middle text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className=""></path>
                                    </svg>
                                </div>
                                <p className="ml-2 text-sm font-medium text-muted-foreground">TODO Reviews</p>
                            </div>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="mt-8 flex flex-col items-start space-y-4">
                            <h1 className="text-2xl font-bold">Price: <span className="font-extrabold">{product.price}$</span></h1>
                            <p className="text-lg font-bold">Available Units: <span className="font-extrabold">{product.stock}</span></p>
                        </div>
                        <div className="mt-10 flex flex-col items-center justify-between space-y-4 border-t border-b py-4 sm:flex-row sm:space-y-0">
                            <div className="flex w-2/6 items-end">
                                <Input className="" placeholder="wanted units" type="number" min={0} max={product.stock}/>
                            </div>
                            <Button className="inline-flex items-center justify-center rounded-md px-12 py-6 text-center text-base font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Add to cart
                            </Button>
                        </div>

                        <ul className="mt-8 space-y-2">
                            <li className="flex items-center text-left text-sm font-medium text-muted-foreground">
                                <svg className="mr-2 block h-5 w-5 align-middle text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className=""></path>
                                </svg>
                                Free shipping worldwide
                            </li>

                            <li className="flex items-center text-left text-sm font-medium text-muted-foreground">
                                <svg className="mr-2 block h-5 w-5 align-middle text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" className=""></path>
                                </svg>
                                Cancel Anytime
                            </li>
                        </ul>
                    </div>
                    <div className="lg:col-span-3">
                        <Tabs defaultValue="description">
                            <TabsList>
                                <TabsTrigger value="description" className="hover:text-foreground hover:bg-background/40">Description</TabsTrigger>
                                <TabsTrigger value="specification" className="hover:text-foreground hover:bg-background/40">Specification</TabsTrigger>
                                <TabsTrigger value="reviews" className="hover:text-foreground hover:bg-background/40">Reviews</TabsTrigger>
                            </TabsList>
                            <TabsContent value="description">
                                <div className="mt-8 flow-root sm:mt-12">
                                    <p>{product.description}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="specification">
                                <div className="mt-8 flow-root sm:mt-12">
                                    <Attributes attributes={product.attributes}/>
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews">
                                <h1>Reviews</h1>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductView