import { Badge } from "@/components/ui/badge";

export type SearchProduct = {
    id:number
    name:string
    price:number
    image:string
    category:{
        id:number
        name:string
    }
}

type SearchItemProps = {
    item:SearchProduct
    last:boolean|undefined
}

function SearchItem({item,last}:SearchItemProps){
    return <>
        <div className="flex flex-row w-fit items-center mb-1 px-1 bg-zinc-300 rounded cursor-pointer transition ease-in-out duration-300 hover:shadow-md dark:hover:shadow-black/30 p-1 dark:bg-zinc-700">
            <img src={`http://localhost:8000/static/${item.image}`} alt="" className="w-1/4 sm:w-1/6 md:w-1/4 mr-3 rounded" />
            <div className="">
                <p className="font-medium text-base">{item.name}</p>
                <p className="font-medium text-sm">{item.price} $</p>
                <Badge className="mt-1">{item.category.name}</Badge>
            </div>
        </div>
        {
            !last&&<hr className="my-1 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100" />
        }
    </>
}

export default SearchItem;