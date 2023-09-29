import { Form, FormItem, FormLabel, FormField, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup,RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"
import Star from "./Star";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { axiosClient } from "@/axiosClient";
import { useParams } from "react-router-dom";
import { MyReview } from "./review";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
    rate: z.enum(["1","2","3","4","5"],{required_error:"You need to give a rating"}),
    comment: z.string().optional()
})

function ReviewForm({review}:{review:MyReview|null}) {
    const {productId} = useParams()
    const {toast} = useToast()
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { rate: review?.rate.toString() as '1', comment: review?.comment } })
    const onSubmit = async(values: z.infer<typeof formSchema>) => {
        try {
            console.log(values);
            if(review){
                const response = await axiosClient.put(`/product/review/${productId}`,{...values,rate:parseInt(values.rate)})
                toast({description:"review updated"})
            }else{
                const response = await axiosClient.post(`/product/review/${productId}`,{...values,rate:parseInt(values.rate)})
                toast({description:"review created"})
            }
        } catch (error) {
            if(error instanceof AxiosError){

            }
            console.error(error);            
        }
    }
    return (
        <div className="w-full">
            <h2>Review The product</h2>
            <Form {...form}>
                <form
                    method="POST"
                    className="w-full flex flex-col justify-center items-center space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="rate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        {...field}
                                        className="flex flex-row space-x-1"
                                    >
                                        {[1, 2, 3, 4, 5].map((i) => {
                                            return (
                                                <FormItem
                                                    key={i}
                                                    className="flex flex-col items-center "
                                                >
                                                    <FormControl>
                                                        <RadioGroupItem
                                                            value={i.toString()}
                                                            className="opacity-0"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="cursor-pointer">
                                                        {parseInt(
                                                            field.value
                                                        ) >= i ? (
                                                            <Star className="h-6 w-6" />
                                                        ) : (
                                                            <Star
                                                                className="h-6 w-6"
                                                                variant="empty"
                                                            />
                                                        )}
                                                    </FormLabel>
                                                </FormItem>
                                            );
                                        })}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="comment"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl data-te-input-wrapper-init>
                                    <div className="w-96">
                                        <div className="relative w-full min-w-[200px]">
                                            <textarea
                                                {...field}
                                                className="peer h-full min-h-[100px] w-full resize-y rounded-md border border-foreground/30 bg-foreground/20 px-3 py-2.5 font-sans text-sm font-normal text-foreground outline outline-0 transition-all focus:border-2 focus:border-foreground/50 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-muted"
                                                placeholder=" "
                                            ></textarea>
                                            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-xs font-normal leading-tight text-foreground transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5  before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-foreground  peer-focus:text-[11px] peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-muted">
                                                Comment
                                            </label>
                                        </div>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Add</Button>
                </form>
            </Form>
        </div>
    );
}

export default ReviewForm