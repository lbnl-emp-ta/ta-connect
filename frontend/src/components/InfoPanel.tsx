import { Paper, Typography } from '@mui/material';

interface InfoPanelProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Consistently styled panel for informational content.
 * The header can be plain text or a more complex React node.
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({ header, children }) => {
  return (
    <Paper
      sx={{
        height: 'stretch',
        width: 'stretch',
        borderWidth: 10,
        borderStyle: 'solid',
        borderColor: 'primary.main',
        borderRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}
    >
      <Typography
        component="h3"
        sx={{
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          paddingBottom: 1,
        }}
      >
        {header}
      </Typography>
      {children}
    </Paper>
  );
};
