import { AppLink } from '@/components/AppLink';
import { Box, Typography, Stack, Link } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ mt: 4 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        TA Connect
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <AppLink to="/">
          <Typography variant="body2" align="center">
            Requests Dashboard
          </Typography>
        </AppLink>
        <Box>|</Box>
        <Link href="https://emp.lbl.gov/projects/state-TA-program" target="_blank">
          <Typography variant="body2" align="center">
            State Technical Assistance Program
          </Typography>
        </Link>
      </Stack>
      <Typography variant="body2" color="text.secondary" align="center">
        Supported by Lawrence Berkeley National Laboratory
      </Typography>
    </Box>
  );
};
