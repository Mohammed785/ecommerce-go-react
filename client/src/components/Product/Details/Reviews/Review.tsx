import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { ReviewType } from "./review"

export function ReviewSkeleton(){
    return <Skeleton className="my-4 bg-foreground/10 p-3 rounded-md">
        <Skeleton className="flex items-center justify-between mb-4 space-x-4">
            <Skeleton className="flex flex-row items-center space-x-2">
                <Skeleton className="w-10 h-10 rounded-full bg-foreground/30"/>
                <Skeleton className="w-[100px] h-3 bg-foreground/30"/>
            </Skeleton>
            <Skeleton className="flex items-center mb-1 space-x-1">
                {
                    new Array(5).fill(<Skeleton className="w-4 h-4 bg-foreground/40"/>)
                }
            </Skeleton>
        </Skeleton>
        <Skeleton className="mb-5 w-20 h-3 text-sm bg-muted-foreground"/>
        <Skeleton className="mb-2 w-full h-6 bg-foreground/60"/>
    </Skeleton>
}

function Review({ review }: { review: ReviewType }) {
    const [readMore, setReadMore] = useState(false)
    return <article className="my-4 bg-foreground/10 p-3 rounded-md">
        <div className="flex items-center justify-between mb-4 space-x-4">
            <div className="flex flex-row items-center space-x-2 font-medium text-foreground">
                <Avatar className="w-10 h-10 rounded-full">
                    <AvatarFallback>{`${review.author.firstName[0] + review.author.lastName[0]}`.toUpperCase()}</AvatarFallback>
                </Avatar>
                <p>{`${review.author.firstName} ${review.author.lastName}`}</p>
            </div>
            <div className="flex items-center mb-1 space-x-1">
                {
                    new Array(5).fill(<svg className="w-4 h-4 text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>, 0, review.rate).fill(<svg className="w-4 h-4 text-gray-400 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>, review.rate)
                }
            </div>
        </div>
        <footer className="mb-5 text-sm text-muted-foreground"><p>Posted At {new Date(review.createdAt).toLocaleString()} </p></footer>
        <p className="mb-2 text-foreground">{readMore ? review.comment : review.comment?.slice(0, 310)}.</p>
        {review.comment && (review.comment.length > 310) && <Button onClick={() => { setReadMore(true) }} className="block h-5 mb-5 p-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500" variant={"link"}>Read more</Button>}
        <aside>
            <p className="mt-1 text-xs text-foreground">19 people found this helpful</p>
            <div className="flex items-center mt-3 space-x-3 divide-x divide-foreground/50">
                <a href="#" className="text-gray-900 bg-white border border-gray-500 focus:outline-none hover:bg-gray-200 focus:ring-4 focus:ring-gray-400 font-medium rounded-lg text-xs px-2 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Helpful</a>
                <a href="#" className="pl-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">Report abuse</a>
            </div>
        </aside>
    </article>

}

export default Review