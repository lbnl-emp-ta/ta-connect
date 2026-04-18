import { Box, Paper, Typography } from '@mui/material';

interface InfoPanelProps {
  header?: React.ReactNode;
  /**
   * Optional tabs to display above the content.
   * If provided, the header will not be displayed.
   */
  tabs?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Consistently styled panel for informational content.
 * The header can be plain text or a more complex React node.
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({ header, tabs, children }) => {
  return (
    <Paper
      sx={{
        height: 'stretch',
        width: 'stretch',
      }}
    >
      {tabs && (
        <Box
          sx={{
            backgroundColor: 'grey.50',
            borderBottom: '1px solid',
            borderBottomColor: 'grey.50',
          }}
        >
          {tabs}
        </Box>
      )}
      {!tabs && header && (
        <Typography
          component="h3"
          sx={{
            backgroundColor: 'grey.50',
            borderBottom: '1px solid',
            borderBottomColor: 'grey.50',
            fontWeight: 'bold',
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          {header}
        </Typography>
      )}
      {children}
    </Paper>
  );
};
