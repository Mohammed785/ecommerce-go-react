import { Input } from "@/components/ui/input";

function SearchBar(){
    return (
        <div className="relative w-full justify-start text-sm sm:pr-12 md:w-56 lg:w-80">
            <Input className="w-full" type="search" placeholder="Search Products..."/>
        </div>
    )
}

export default SearchBar;