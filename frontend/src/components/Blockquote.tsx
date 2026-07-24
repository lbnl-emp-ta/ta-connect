import { Box } from '@mui/material';
import { PropsWithChildren } from 'react';

interface BlockquoteProps extends PropsWithChildren {
  /** Only show one line of text and cut off the rest with an ellipsis */
  clamp?: boolean;
}

export const Blockquote: React.FC<BlockquoteProps> = ({ clamp, children }) => {
  return (
    <Box
      component="blockquote"
      sx={{
        borderLeft: '4px solid',
        borderColor: 'divider',
        pl: 2,
        ml: 0,
        my: 1,
        whiteSpace: clamp ? 'nowrap' : 'normal',
        overflow: clamp ? 'hidden' : 'visible',
        textOverflow: clamp ? 'ellipsis' : 'clip',
      }}
    >
      {children}
    </Box>
  );
};
