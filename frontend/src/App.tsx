import { Typography } from '@mui/material';
import { useAuthSessionQuery } from './api/sessions/hooks'
import './App.css'

import IntakeForm from './components/IntakeForm'
import SignupForm from './components/SignupForm';



function App() {
    const { isLoading } = useAuthSessionQuery();
    if (isLoading) {
        return <Typography variant='h1'>Loading...</Typography>;
    }

    return (
        <IntakeForm>
        </IntakeForm>
        // <SignupForm>
        // </SignupForm>
    )
}

export default App