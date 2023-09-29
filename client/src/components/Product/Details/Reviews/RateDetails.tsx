import { Progress } from "@/components/ui/progress"
import Star from "./Star"
import { ReviewsDetails } from "./review"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    details:ReviewsDetails;
    loading:boolean;
}

function RateDetails({details,loading}:Props) {
    if(loading){
        return <Skeleton className="flex flex-row items-center justify-between space-x-8 w-full mt-4 h-72">
            <Skeleton className="flex flex-col justify-center items-center space-y-2 w-1/3 h-full ">
                <Skeleton className="w-12 h-3 bg-foreground/80"/>
                <Skeleton className="flex flex-row space-x-1 bg-card-foreground ">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-4 h-4" />
                </Skeleton>
            </Skeleton>
            <Skeleton className="w-2/3 space-y-4 flex flex-col ">
                <Skeleton className="w-full h-4 bg-muted-foreground"/>
                <Skeleton className="w-full h-4 bg-muted-foreground"/>
                <Skeleton className="w-full h-4 bg-muted-foreground"/>
                <Skeleton className="w-full h-4 bg-muted-foreground"/>
                <Skeleton className="w-full h-4 bg-muted-foreground"/>
            </Skeleton>
        </Skeleton>
    }
    return <div className="flex flex-row items-center justify-between space-x-8 w-full mt-4">
            <div className="flex flex-col justify-center items-center space-y-2 w-1/3">
                <p className="font-bold text-5xl ">{details.avg}</p>
                <div className="flex flex-row space-x-2">
                    {
                        new Array(5).fill(0).map((_,idx)=>{
                            if(idx+1<details.avg){
                                return <Star key={idx} variant="filled"/>
                            }else{
                                if((idx+1)-details.avg>=1){
                                    return <Star key={idx} variant="empty"/>
                                }else{
                                    return <Star key={idx} fillPercent={Math.trunc((details.avg%1)*100)}/>
                                }
                            }
                        })
                    }
                </div>
                <p className="text-md text-muted-foreground">{Intl.NumberFormat("en", { notation: "compact" }).format(details.total)} reviews</p>
            </div>
            <div className="w-2/3 space-y-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-muted-foreground hover:underline">5</p>
                    <Progress value={Math.trunc((details.five/details.total)*100)} />
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-muted-foreground hover:underline">4</p>
                <Progress value={Math.trunc((details.four / details.total) * 100)} />
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-muted-foreground hover:underline">3</p>
                <Progress value={Math.trunc((details.three / details.total) * 100)} />
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-muted-foreground hover:underline">2</p>
                <Progress value={Math.trunc((details.two / details.total) * 100)} />
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-muted-foreground hover:underline">1</p>
                <Progress value={Math.trunc((details.one / details.total) * 100)} />
                </div>
            </div>
        </div>
}
export default RateDetails