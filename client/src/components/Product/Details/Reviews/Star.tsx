import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"


function Star({ className, variant = "filled", fillPercent, ...props }: HTMLAttributes<SVGElement> & { variant?: "filled" | "empty", fillPercent?: number }) {
    const halfFilled = fillPercent && variant != "empty"
    return <svg className={cn("w-4 h-4", `${variant === "filled" ? "text-yellow-400" : "text-gray-400 dark:text-gray-600"}`, className)} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20" {...props}>
        {
            halfFilled && <defs>
                <linearGradient id="grad">
                    <stop offset={`${fillPercent}%`} stop-color="currentColor" />
                    <stop offset={`${100 - fillPercent}%`} className="text-gray-400 dark:text-gray-600" stop-color="currentColor" />
                </linearGradient>
            </defs>
        }
        <path fill={halfFilled ? "url(#grad)" : undefined} d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
    </svg>
}
export default Star