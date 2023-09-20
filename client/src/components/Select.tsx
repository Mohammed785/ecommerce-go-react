import Select,{Props} from "react-select"
import makeAnimated from "react-select/animated"

const Animated = makeAnimated()

function ReactSelect(props:Props){
    return <Select components={Animated} {...props} classNames={{
        container: (state) => {
            const containerBase = "flex min-h-10 w-full capitalize items-center justify-between rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            if(state.isFocused){
                return `${containerBase} ring-offset-background outline-none ring-2 ring-ring ring-offset-2`
            }else if(state.isDisabled){
                return `${containerBase} cursor-not-allowed opacity-50`
            }else{
                return containerBase
            }
        },
        control: () => "w-full flex cursor-pointer",
        dropdownIndicator: () => "h-4 w-4 opacity-50 cursor-pointer",
        indicatorSeparator: () => "my-1 h- border-t-0 bg-transparent bg-gradient-to-r from-transparent via-zinc-500 to-transparent opacity-25 dark:opacity-100",
        menu: () => "mt-1 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md left-0 p-1",
        option: (state) => {
            const baseStyle = "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none"
            if(state.isFocused){
                return `${baseStyle} bg-accent text-accent-foreground`
            }else if(state.isDisabled){
                return `${baseStyle} opacity-50 pointer-events-none `
            }else{
                return baseStyle
            }
        },
        multiValue: () => "bg-foreground hover:text-accent-foreground hover:bg-accent text-background rounded-lg border py-0.5 px-2"
    }} unstyled closeMenuOnSelect={false} />
}


export default ReactSelect as Select;