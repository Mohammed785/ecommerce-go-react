import Select,{Props} from "react-select"
import makeAnimated from "react-select/animated"

const Animated = makeAnimated()

function ReactSelect(props:Props){
    return <Select components={Animated} {...props} classNames={{
        container: () => "flex min-h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full capitalize",
        control: () => "w-full flex",
        dropdownIndicator: () => "h-4 w-4 opacity-50",
        indicatorSeparator: () => "my-1 h- border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100",
        menu: () => "mt-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md left-0 p-1",
        option: () => "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground  hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        multiValue: () => "bg-foreground text-background rounded-lg border py-0.5 px-2"
    }} unstyled  />
}


export default ReactSelect as Select;