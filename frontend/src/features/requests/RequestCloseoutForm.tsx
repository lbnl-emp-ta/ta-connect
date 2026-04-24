import { useRequestsContext } from '@/features/requests/RequestsContext';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { TARequestDetail } from '../../api/dashboard/types';

interface RequestCloseoutFormProps {
  requestId: TARequestDetail['id'];
}

export const RequestCloseoutForm: React.FC<RequestCloseoutFormProps> = ({ requestId }) => {
  const { closeoutDialogOpen, setCloseoutDialogOpen } = useRequestsContext();

  const handleDialogClose = () => {
    setCloseoutDialogOpen(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={closeoutDialogOpen}
      onClose={handleDialogClose}
      disableRestoreFocus
    >
      <form>
        <DialogTitle>Upload Attachment</DialogTitle>
        <DialogContent>
          <Stack></Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained" color="primary" type="submit">
            Upload
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
