import { Box, Paper, SxProps } from '@mui/material';

interface InfoPanelProps {
  header?: React.ReactNode;
  /**
   * Optional tabs to display above the content.
   * If provided, the header will not be displayed.
   */
  tabs?: React.ReactNode;
  children: React.ReactNode;
  sx?: SxProps;
}

/**
 * Consistently styled panel for informational content.
 * The header can be plain text or a more complex React node.
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({ header, tabs, children, sx }) => {
  return (
    <Paper
      sx={{
        height: 'stretch',
        width: 'stretch',
        ...sx,
      }}
    >
      {tabs && (
        <Box
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.100',
          }}
        >
          {tabs}
        </Box>
      )}
      {!tabs && header && (
        <Box
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'grey.100',
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          {header}
        </Box>
      )}
      {children}
    </Paper>
  );
};
