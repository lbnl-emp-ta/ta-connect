import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar} from '@mui/material'
import { createFileRoute,  Outlet, redirect, useNavigate,} from '@tanstack/react-router'
import FeaturedPlayList from '@mui/icons-material/FeaturedPlayList';

export const Route = createFileRoute('/_private/dashboard')({
    beforeLoad ({ location }) {
        if (location.pathname === "/dashboard" || location.pathname ==="/dashboard/")
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw redirect({ to: "/dashboard/request-table" })
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
                <ListItem key={"Requests"} disablePadding>
                    <ListItemButton onClick={() => { void navigate({to: "/dashboard/request-table"}); }}> 
                        <ListItemIcon>
                            <FeaturedPlayList/>
                        </ListItemIcon>
                        <ListItemText primary={"Requests"} />
                    </ListItemButton>
                </ListItem>
                <ListItem key={"Test"} disablePadding>
                    <ListItemButton onClick={() => { void navigate({to: "/dashboard/test-tab"}); }}> 
                        <ListItemIcon>
                            <FeaturedPlayList/>
                        </ListItemIcon>
                        <ListItemText primary={"Test"} />
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


