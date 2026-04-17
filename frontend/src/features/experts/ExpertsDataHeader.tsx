import { Typography } from '@mui/material';
import { TAExpert } from '../../api/dashboard/types';

interface ExpertsDataHeaderProps {
  experts: TAExpert[] | null;
}

export const ExpertsDataHeader: React.FC<ExpertsDataHeaderProps> = ({ experts }) => {
  if (experts === null) {
    return <Typography sx={{ flex: 1, mx: 0.5 }}>Loading...</Typography>;
  }
  return (
    <Typography sx={{ flex: 1, mx: 0.5 }}>
      {experts.length} {experts.length === 1 ? 'expert' : 'experts'}
    </Typography>
  );
};
