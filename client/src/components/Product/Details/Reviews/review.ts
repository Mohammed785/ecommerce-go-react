export type ReviewType = {
    rate: number;
    comment: string | null;
    createdAt: string;
    author: {
        id: number;
        firstName: string;
        lastName: string;
    };
};

export type MyReview = {
    rate: number;
    comment: string;
    createdAt: string;
};

export type ReviewsDetails = {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    avg: number;
    total: number;
};

export type DetailsState = {
    details:ReviewsDetails,
    review:MyReview|null
    loading:boolean
}

