import { Link, Stack } from '@mui/material';
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
    <Stack sx={{ padding: 2 }}>
      {attachments.length > 0 &&
        attachments.map((attachment) => (
          <Stack key={attachment.id} direction="row" spacing={2} alignItems="center">
            <Link
              // This needs to be a fetch so that I can pass context
              href={`${apiUrl}/requests/${requestId}/download-attachment/${attachment.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {attachment.title}
            </Link>
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
