import { Button, ButtonProps } from '@mui/material';
import { redirectToProvider } from '../api/accounts/login';

interface SocialLoginButtonProps extends ButtonProps {
  name: string;
  id: string;
}

export const SocialLoginButton = ({ name, id, ...otherProps }: SocialLoginButtonProps) => {
  const handleClick = () => {
    redirectToProvider(id, '/account/provider/callback', 'login');
  };

  return (
    <Button onClick={handleClick} fullWidth variant="contained" {...otherProps}>
      Continue with {name}
    </Button>
  );
};
