import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Select, Toolbar} from '@mui/material'
import { createFileRoute,  Outlet, redirect, useNavigate,} from '@tanstack/react-router'
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

export const Route = createFileRoute('/_private/dashboard')({
    beforeLoad ({ location }) {
        if (location.pathname === "/dashboard" || location.pathname ==="/dashboard/")
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: "/dashboard/requests" })
    },
    component: DashboardComponent, 
})

function DashboardComponent() {
    const navigate = useNavigate();

    return (
        <>
        <Drawer
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar/>
            <List>
                <ListItem>
                    <ListItemText primary={"Viewing as:"}>
                    </ListItemText>
                </ListItem>
                <ListItem>
                   <Select
                        sx={{
                            width: "stretch",
                        }}
                   />
                </ListItem>
                <ListItem key={"Requests"} disablePadding>
                    <ListItemButton onClick={() => { void navigate({to: "/dashboard/requests"}); }}> 
                        <ListItemIcon>
                            <AssignmentIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"Requests"} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={"Experts"} disablePadding>
                    <ListItemButton onClick={() => { void navigate({to: "/dashboard/experts"}); }}> 
                        <ListItemIcon>
                            <PeopleIcon/>
                        </ListItemIcon>
                        <ListItemText primary={"Experts"} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
        <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
            <Outlet/>
        </Box>
        </>
    )
}


