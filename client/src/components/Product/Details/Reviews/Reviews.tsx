import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { DetailsState, ReviewType } from "./review"
import { AxiosError } from "axios"
import { axiosClient } from "@/axiosClient"
import { TabsContent } from "@/components/ui/tabs"
import RateDetails from "./RateDetails"
import ReviewForm from "./ReviewForm"
import Review, { ReviewSkeleton } from "./Review"

type ReviewState = {
    reviews: ReviewType[]|null,
    cursor: number | null,
    loading:boolean
}

function Reviews() {
    const [reviewsState, setReviewsState] = useState<ReviewState>({ reviews: null, cursor: null,loading:false })
    const [rateDetails,setRateDetails] = useState<DetailsState>({details:{avg:0,five:0,four:0,one:0,three:0,two:0,total:0},review:null,loading:false})
    const { productId } = useParams()
    const loadReviews = async () => {
        setReviewsState({...reviewsState,loading:true})
        try {
            const response = await axiosClient.get(`/product/review/${productId}?${reviewsState.cursor ? `cursor=${reviewsState.cursor}` : ""}`)
            setReviewsState({ reviews: response.data.reviews, cursor: response.data.cursor,loading:false })
        } catch (error) {
            setReviewsState({...reviewsState,loading:false})
            if (error instanceof AxiosError) {

            }
            console.error(error);
        }
    }
    const loadDetails = async () => {
        setRateDetails({...rateDetails,loading:true})
        try {
            const response = await axiosClient.get(`/product/review/${productId}/details`)
            setRateDetails({ details: response.data.details,review:response.data.review,loading:false })
        } catch (error) {
            setRateDetails({...rateDetails,loading:false})
            if (error instanceof AxiosError) {
                
            }
            console.error(error);
        }
    }
    useEffect(() => {
        loadReviews()
        loadDetails()
    }, [productId])
    return <>
        <TabsContent value="reviews">
            <div className="flex flex-col w-full space-y-4">
                <ReviewForm review={rateDetails.review}/>
                <RateDetails details={rateDetails.details} loading={rateDetails.loading}/>
                <div className="space-y-4">
                    {
                        reviewsState.loading && new Array(5).fill(<ReviewSkeleton />)
                    }
                    {
                        reviewsState.reviews?!reviewsState.loading&&reviewsState.reviews.map((review) => (
                            <Review key={review.author.id} review={review} />
                        ))
                        :<h1>Be the first to review this product</h1>
                    }
                </div>
            </div>
        </TabsContent>
    </>
}

export default Reviews