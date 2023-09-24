import { Skeleton } from "@/components/ui/skeleton"

function ProductCardSkeleton(){
    return <div className="w-72 lg:w-64 shadow-md rounded-xl">
        <Skeleton className="h-60 w-72 lg:w-64 object-cover rounded-t-xl"/>
        <div className="px-3 py-3 mt-2 w-72 lg:w-64 rounded-b-xl">
            <Skeleton className="w-10 h-3 mr-3 uppercase"/>
            <Skeleton className="w-full h-4 mt-2"/>
            <div className="flex items-center">
                <Skeleton className="w-12 h-3 cursor-auto my-3"/>
                <Skeleton className="w-10 h-3 ml-2"/>
                <div className="ml-auto">
                    <Skeleton className="w-7 h-7"/>
                </div>
            </div>
        </div>
    </div>
}

export default ProductCardSkeleton