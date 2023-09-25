import { ProductAttribute } from "@/context/ProductsContext"
import { Table,TableBody,TableRow,TableCell } from "@/components/ui/table"

function Attributes({attributes}:{attributes:ProductAttribute[]}){
    return <Table>
        <TableBody>
                {
                    attributes.map(attr=>(
                        <TableRow>
                            <TableCell>{attr.name}</TableCell>
                            <TableCell>{attr.value}</TableCell>
                        </TableRow>
                    ))
                }
        
        </TableBody>    
    </Table>
}

export default Attributes