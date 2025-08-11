import { Stack } from '@mui/material';
import { TAAttachment, TARequestDetail } from '../../api/dashboard/types';
import { apiUrl } from '../../utils/queryOptions';

interface RequestAttachmentsProps {
  requestId: TARequestDetail['id'];
  attachments: TAAttachment[];
}

export const RequestAttachments: React.FC<RequestAttachmentsProps> = ({
  requestId,
  attachments,
}) => {
  return (
    <Stack>
      {attachments.length > 0 &&
        attachments.map((attachment) => (
          <Stack key={attachment.id} direction="row" spacing={2} alignItems="center">
            <a
              href={`${apiUrl}/requests/${requestId}/download-attachment/${attachment.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {attachment.title}
            </a>
          </Stack>
        ))}
      {attachments.length === 0 && (
        <Stack direction="row" spacing={2} alignItems="center">
          <span>No attachments available.</span>
        </Stack>
      )}
    </Stack>
  );
};
