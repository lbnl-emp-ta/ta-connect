import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { TANote, TARequestDetail } from '../../api/dashboard/types';
import { useCreateNoteMutation, useDeleteNoteMutation } from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';
import { formatDatetime } from '../../utils/utils';
import { useEffect, useState } from 'react';

interface RequestNotesProps {
  requestId: TARequestDetail['id'];
  notes?: TANote[] | null;
}

export const RequestNotes: React.FC<RequestNotesProps> = ({ requestId, notes }) => {
  const { identity, detailedIdentity } = useIdentityContext();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number>();
  const createNoteMutation = useCreateNoteMutation(requestId.toString(), identity);
  const deleteNoteMutation = useDeleteNoteMutation(requestId.toString(), identity);
  const [noteDescription, setNoteDescription] = useState('');

  notes?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNoteDescription(event.target.value);
  };

  const handleUploadDialogClose = () => {
    setShowAddDialog(false);
    setNoteDescription('');
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    createNoteMutation.mutate({
      author: identity?.user,
      request: requestId,
      content: noteDescription,
    });
  };

  const handleInitiateDelete = (noteId: number) => {
    setNoteToDelete(noteId);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (noteToDelete) {
      deleteNoteMutation.mutate(noteToDelete.toString());
      setShowDeleteDialog(false);
    }
  };

  useEffect(() => {
    if (createNoteMutation.isSuccess || createNoteMutation.isError) {
      setShowAddDialog(false);
      setNoteDescription('');
      createNoteMutation.reset();
    }
  }, [createNoteMutation.isSuccess, createNoteMutation.isError]);

  useEffect(() => {
    if (deleteNoteMutation.isSuccess || deleteNoteMutation.isError) {
      setShowDeleteDialog(false);
      deleteNoteMutation.reset();
    }
  }, [deleteNoteMutation.isSuccess, deleteNoteMutation.isError]);

  return (
    <Stack spacing={1} sx={{ padding: 2 }}>
      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddDialog(true)}>
        Add note
      </Button>
      {notes &&
        notes.length > 0 &&
        notes.map((note) => (
          <Stack
            key={note.id}
            spacing={1}
            sx={{ border: '1px solid', borderColor: 'grey.300', padding: 1, overflow: 'auto' }}
          >
            <Typography>{note.content}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="textSecondary" sx={{ flexGrow: 1 }}>
                {note.author_name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDatetime(note.timestamp)}
              </Typography>
              {detailedIdentity?.role.name === 'Admin' && (
                <IconButton onClick={() => handleInitiateDelete(note.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        ))}
      {(!notes || notes.length === 0) && (
        <Stack direction="row" spacing={2} alignItems="center">
          <span>No notes for this request.</span>
        </Stack>
      )}
      <Dialog fullWidth maxWidth="sm" open={showAddDialog} onClose={handleUploadDialogClose}>
        {!createNoteMutation.isPending && (
          <form onSubmit={handleSubmit}>
            <DialogTitle>Add Note</DialogTitle>
            <DialogContent>
              <Stack sx={{ marginTop: 2 }}>
                <TextField
                  value={noteDescription}
                  label="Description"
                  multiline
                  rows={4}
                  onChange={handleDescriptionChange}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={handleUploadDialogClose}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit">
                Add
              </Button>
            </DialogActions>
          </form>
        )}
        {createNoteMutation.isPending && (
          <DialogContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography>Adding note</Typography>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        {!deleteNoteMutation.isPending && (
          <>
            <DialogContent>
              <Typography>Are you sure you want to delete this note?</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </DialogActions>
          </>
        )}
        {deleteNoteMutation.isPending && (
          <DialogContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography>Deleting note</Typography>
            </Stack>
          </DialogContent>
        )}
      </Dialog>
    </Stack>
  );
};
