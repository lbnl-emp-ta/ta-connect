import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { TAAttachment, TARequestDetail } from '../../api/dashboard/types';
import {
  apiUrl,
  useAttachmentMutation,
  useDeleteAttachmentMutation,
} from '../../utils/queryOptions';
import { useIdentityContext } from '../identity/IdentityContext';
import { getCSRFToken } from '../../utils/cookies';
import { downloadBlob, formatDatetime } from '../../utils/utils';
import { useState } from 'react';
import { FileUploadInput } from '../../components/FileUploadInput';

interface RequestAttachmentsProps {
  requestId: TARequestDetail['id'];
  attachments: TAAttachment[];
}

export const RequestAttachments: React.FC<RequestAttachmentsProps> = ({
  requestId,
  attachments,
}) => {
  const { identity } = useIdentityContext();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<number>();
  const uploadAttachmentMutation = useAttachmentMutation(requestId.toString(), identity);
  const deleteAttachmentMutation = useDeleteAttachmentMutation(requestId.toString(), identity);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentTitle, setAttachmentTitle] = useState('');
  const [attachmentDescription, setAttachmentDescription] = useState('');

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentTitle(event.target.value);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentDescription(event.target.value);
  };

  const handleUploadDialogClose = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setAttachmentTitle('');
    setAttachmentDescription('');
  };

  const handleUploadSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.set('file', selectedFile as Blob);
    formData.set('title', attachmentTitle);
    formData.set('description', attachmentDescription);
    uploadAttachmentMutation.mutate(formData);
    setShowUploadDialog(false);
  };

  const handleDownload = (attachmentId: number) => {
    fetch(`${apiUrl}/requests/${requestId}/download-attachment/${attachmentId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': getCSRFToken() || '',
        Context: identity ? JSON.stringify(identity) : '',
      },
    })
      .then((response) => response.blob())
      .then((blob) => downloadBlob(blob, `attachment_${attachmentId}`));
  };

  const handleInitiateDelete = (attachmentId: number) => {
    setAttachmentToDelete(attachmentId);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (attachmentToDelete) {
      deleteAttachmentMutation.mutate(attachmentToDelete.toString());
      setShowDeleteDialog(false);
    }
  };

  return (
    <Stack spacing={1} sx={{ padding: 2 }}>
      <Button
        variant="outlined"
        startIcon={<AttachFileIcon />}
        onClick={() => setShowUploadDialog(true)}
      >
        Upload attachment
      </Button>
      {attachments.length > 0 &&
        attachments.map((attachment) => (
          <Stack
            key={attachment.id}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ border: '1px solid', borderColor: 'grey.300', padding: 1 }}
          >
            <IconButton onClick={() => handleDownload(attachment.id)}>
              <DownloadIcon />
            </IconButton>
            <Stack spacing={0} flexGrow={1}>
              <Stack direction="row" alignItems="center">
                <Typography sx={{ flex: 1 }}>{attachment.title}</Typography>
                <Typography fontSize="small">{formatDatetime(attachment.uploaded_at)}</Typography>
              </Stack>
              <Typography variant="body2" color="grey.500">
                {attachment.description || 'No description'}
              </Typography>
            </Stack>
            <IconButton onClick={() => handleInitiateDelete(attachment.id)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
      {attachments.length === 0 && (
        <Stack direction="row" spacing={2} alignItems="center">
          <span>No attachments available.</span>
        </Stack>
      )}
      <Dialog fullWidth maxWidth="sm" open={showUploadDialog} onClose={handleUploadDialogClose}>
        <form onSubmit={handleUploadSubmit}>
          <DialogTitle>Upload Attachment</DialogTitle>
          <DialogContent>
            <Stack>
              <FileUploadInput
                name="attachment"
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                required
                onFileChange={handleFileChange}
              >
                Select file
              </FileUploadInput>
              <TextField
                value={attachmentTitle}
                label="Title"
                required
                onChange={handleTitleChange}
              />
              <TextField
                value={attachmentDescription}
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
              Upload
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogContent>
          <Typography>Are you sure you want to delete this attachment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
