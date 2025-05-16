import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Box, Button, Collapse, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { dateDiffInDays } from '../../../utils/datetimes'
import { useState } from 'react'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { CustomerRequestRelationship } from '../../../api/dashboard/types'
import { customerRequestRelationshipOptions } from '../../../utils/queryOptions'

export const Route = createFileRoute('/_private/dashboard/requests')({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(customerRequestRelationshipOptions())
    },
    component: RequestsPage,
})

function RequestTableRow(props: {row: CustomerRequestRelationship & {age: number}}) {
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
                <TableCell align="center" component="th" scope="row">
                    {row.id}
                </TableCell>
                <TableCell align="center">{row.age}</TableCell>
                <TableCell align="right">{row.request.status}</TableCell>
                <TableCell align="right">{row.request.depth}</TableCell>
                <TableCell align="right">{row.customer.name}</TableCell>
                <TableCell align="right">{row.customer.email}</TableCell>
                <TableCell align="right">{row.customer.phone}</TableCell>
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
                                        <TableCell>{row.request.description}</TableCell>
                                        <TableCell>{row.request.proj_start_date || "Undetermined"}</TableCell>
                                        <TableCell>{row.request.proj_end_date || "Undetermined"}</TableCell>
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
    const { data: customerRequestRelationships } = useSuspenseQuery(customerRequestRelationshipOptions())
    const tableData = customerRequestRelationships.map((crr) => {
        const ageInDays = dateDiffInDays(new Date(crr.request.date_created), new Date());
        return {...crr, age: ageInDays}
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

function RequestsPage() {
    return (
        <>
        <Grid container spacing={4} display="flex" justifyContent="center" sx={{width: 1000}}>
            <Grid container size={12}>
                <Grid>
                    <Button>Show Previous</Button>
                </Grid>
                <Grid>
                    <Button>Show Next</Button>
                </Grid>
                <Grid size={"grow"} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant='h4' display={"inline"} >
                            View: Request #?
                    </Typography>
                </Grid>
                <Button>More Actions</Button>
                <Button>Assign</Button>
            </Grid>
            <Grid size={6} sx={{height: 550}}>
                <Button sx={{height: "stretch", width: "stretch", bgcolor: "blue"}}>
                </Button>
            </Grid>
            <Grid container size={6}>
                <Grid size={12}>
                    <Button sx={{height: "stretch", width: "stretch", bgcolor: "blue"}}>
                    </Button>
                </Grid>
                <Grid size={12}>
                    <Button sx={{height: "stretch", width: "stretch", bgcolor: "blue"}}>
                    </Button>
                </Grid>
            </Grid>
            <Grid size={12}>
                <RequestTable/>
            </Grid>
        </Grid>
        </>
    )
}