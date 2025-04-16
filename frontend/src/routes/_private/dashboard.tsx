import { createFileRoute } from '@tanstack/react-router'
import { requestsQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Paper } from '@mui/material'
import { useEffect } from 'react'

export const Route = createFileRoute('/_private/dashboard')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(requestsQueryOptions())
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: requests } = useSuspenseQuery(requestsQueryOptions())

    const table_data = requests.map((request) => (
        {...request, date_created: (new Date(request.date_created)).toLocaleDateString()}
    ))

    useEffect(() => {

    }, [requests])

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'depth', headerName: 'Depth', width: 130 },
        { field: 'description', headerName: 'Description', width: 130 }, 
        { field: 'date_created', headerName: 'Date Created', width: 130 }, 
        { field: 'proj_start_date', headerName: 'Projected Start Date', width: 160 }, 
        { field: 'proj_end_date', headerName: 'Projected End Date', width: 160 }, 
        { field: 'actual_completion_date', headerName: 'Actual Completion Date', width: 180 }, 
    ];

    const paginationModel = { page: 0, pageSize: 5 };

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={table_data}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0 }}
            />
        </Paper>
    )
}
