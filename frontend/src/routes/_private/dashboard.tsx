import { createFileRoute } from '@tanstack/react-router'
import { requestsQueryOptions } from '../../utils/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Box, Button, Collapse, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { dateDiffInDays } from '../../utils/datetimes'
import { useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

export const Route = createFileRoute('/_private/dashboard')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(requestsQueryOptions())
    },
    component: RequestTable, 
})

function RequestTableRow(props: {row: any}) {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.id}
                </TableCell>
                <TableCell align="right">{row.age}</TableCell>
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">{row.depth}</TableCell>
                <TableCell align="right">Placeholder Name</TableCell>
                <TableCell align="right">Placeholder Email</TableCell>
                <TableCell align="right">Placeholder Phone Number</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{margin: 1}}>
                            <Typography variant='h6' gutterBottom component="div">
                                Additional Information 
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Projected Start Date</TableCell>
                                        <TableCell>Projected Completion Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>{row.description}</TableCell>
                                        <TableCell>{row.proj_start_date}</TableCell>
                                        <TableCell>{row.proj_end_date}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

function RequestTable() {
    const { data: TARequests } = useSuspenseQuery(requestsQueryOptions())
    const tableData = TARequests.map((request) => {
        const ageInDays = dateDiffInDays(new Date(request.date_created), new Date());
        return {...request, age: ageInDays}
    });

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table" size="small">
                <TableHead>
                    <TableRow sx={{backgroundColor: "#426ED6"}}>
                        <TableCell align="left" colSpan={8}>
                           <Button variant="outlined" sx={{color: "white"}}>
                               Assign 
                            </Button> 
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell />
                        <TableCell>Request ID</TableCell>
                        <TableCell align="right">Age (in days)</TableCell>
                        <TableCell align="right">Status</TableCell>
                        <TableCell align="right">Depth</TableCell>
                        <TableCell align="right">Customer Name</TableCell>
                        <TableCell align="right">Customer Email</TableCell>
                        <TableCell align="right">Customer Phone Number</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tableData.map((row) => (
                        <RequestTableRow key={row.id} row={row} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    )
}