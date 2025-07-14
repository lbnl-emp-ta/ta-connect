import { Stack } from '@mui/material';

interface ToastMessageProps {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ icon, children }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
      {icon && <span>{icon}</span>}
      {children && <span>{children}</span>}
    </Stack>
  );
};
