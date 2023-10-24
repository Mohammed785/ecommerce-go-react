import { ColumnDef, InitialTableState, TableMeta, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";

interface DataTableProps<TData,TValue>{
    columns: ColumnDef<TData,TValue>[]
    data:TData[],
    meta?:TableMeta<TData>,
    initialState?:InitialTableState
}

function DataTable<TData,TValue>({columns,data,meta,initialState}:DataTableProps<TData,TValue>){
    const table = useReactTable({
        data, columns, initialState,getCoreRowModel:getCoreRowModel(),meta})
    return (
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup=>(
                        <TableRow key={headerGroup.id}>
                            {
                                headerGroup.headers.map((header)=>(
                                    <TableHead key={header.id}>
                                        {
                                            header.isPlaceholder?null
                                            :flexRender(header.column.columnDef.header,header.getContext())
                                        }
                                    </TableHead>
                                ))
                            }
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length?(
                        table.getRowModel().rows.map((row)=>(
                            <TableRow
                            key={row.id}
                            data-state={row.getIsSelected()&&"selected"}>
                                {row.getVisibleCells().map((cell)=>(
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell,cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ):(
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No Result.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
    )
}

export default DataTable;