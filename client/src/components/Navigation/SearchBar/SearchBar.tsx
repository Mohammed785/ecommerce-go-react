import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";
import { axiosClient } from "@/axiosClient";
import { AxiosError } from "axios";
import SearchItem, { SearchProduct } from "./SearchItem";
import { cn } from "@/lib/utils";
import { MdOutlineSearchOff } from "react-icons/md"

type SearchState = {
    q:string,
    loading:boolean,
    products:SearchProduct[]|undefined
}

function SearchBar(){
    const [searchState,setSearchState] = useState<SearchState>({q:"",loading:false,products:undefined})
    const {toast} = useToast()
    const searchProduct = async()=>{
        if (searchState.q.length < 2) {
            toast({ description: `Please enter at least ${2 - searchState.q.length} more letters.` })
            return
        }
        try {
            setSearchState({...searchState,loading:true})
            const response = await axiosClient.get(`/product/search?q=${searchState.q}`)
            setSearchState({...searchState,products:response.data.products,loading:false})
        } catch (error) {
            setSearchState({...searchState,loading:false})
            if(error instanceof AxiosError){
                toast({variant:"destructive",description:error.response?.data.message})
            }else{
                toast({variant:"destructive",description:"something went wrong"})
            }
            console.error(error);
            
        }
    }
    useEffect(()=>{
        if (searchState.q.length < 2) {
            toast({ description: `Please enter at least ${2 - searchState.q.length} more letters.` })
            return
        }
        const timeout = setTimeout(()=>{
            searchProduct()
        },1500)
        return ()=>clearTimeout(timeout)
    },[searchState.q])
    return (
        <div className="relative w-full justify-start text-sm md:w-56 lg:w-80">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <Button variant="ghost" className="p-0 focus:outline-none focus:shadow-outline" onClick={searchProduct}>
                        <SearchIcon className="w-6 h-6"/>
                    </Button>
                </span>
                <Input className="w-full pl-10" type="search" placeholder="Search Products..." onChange={(e)=>setSearchState({...searchState,q:e.target.value})}/>
            </div>
            {
                <div className={cn(searchState.products||searchState.loading ? "block" : "hidden","absolute bg-secondary p-1 w-full mt-1 max-h-fit rounded border-muted")}>
                {
                    searchState.loading ? <p className="text-center font-semibold text-base flex items-center justify-center p-1">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Please wait
                    </p>
                    :searchState.products?
                    searchState.products.map((item,i)=>(
                        <SearchItem key={item.id} item={item} last={i===searchState.products!.length-1}/>
                    )) :(searchState.q&&!searchState.products) &&<p className="text-center font-semibold text-base p-1 flex items-center justify-center">
                        <MdOutlineSearchOff className="text-2xl mr-1" /> No products found
                        </p>
                }
                </div>
            }
        </div>
    )
}

export default SearchBar;