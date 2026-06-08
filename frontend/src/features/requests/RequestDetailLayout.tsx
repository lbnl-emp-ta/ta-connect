import { InfoPanel } from '@/components/InfoPanel';
import { TabPanel } from '@/components/TabPanel';
import { useAdminModeContext } from '@/features/admin-mode/AdminModeContext';
import { RequestAttachments } from '@/features/requests/RequestAttachments';
import { RequestAuditHistory } from '@/features/requests/RequestAuditHistory';
import { RequestCustomerPanel } from '@/features/requests/RequestCustomerPanel';
import { RequestHeader } from '@/features/requests/RequestHeader';
import { RequestInfoPanel } from '@/features/requests/RequestInfoPanel';
import { RequestNotes } from '@/features/requests/RequestNotes';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { RequestStepper } from '@/features/requests/RequestStepper';
import {
  closeoutQueryOptions,
  notesQueryOptions,
  requestDetailQueryOptions,
} from '@/api/queryOptions';
import {
  Badge,
  Button,
  Grid,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { formatDatetime } from '@/utils/utils';
import { RequestScopePanel } from '@/features/requests/RequestScopePanel';
import { RequestOrganizationPanel } from '@/features/requests/RequestOrganizationPanel';

interface RequestDetailLayoutProps {
  requestId: string;
}

export const RequestDetailLayout: React.FC<RequestDetailLayoutProps> = ({ requestId }) => {
  const { isAdminMode } = useAdminModeContext();
  const { data: selectedRequest } = useSuspenseQuery(
    requestDetailQueryOptions(requestId, isAdminMode)
  );
  const { data: selectedRequestNotes } = useSuspenseQuery(
    notesQueryOptions(requestId, isAdminMode)
  );
  const { data: closeoutForm } = useSuspenseQuery(closeoutQueryOptions(requestId, isAdminMode));
  const { sortedRequestsMap, selectedListId, setCurrentIndex, setCloseoutDialogOpen } =
    useRequestsContext();
  const sortedRequests = selectedListId ? (sortedRequestsMap[selectedListId] ?? []) : [];
  const currentIndex = sortedRequests.findIndex((request) => {
    if (requestId) {
      return request.id === parseInt(requestId);
    }
  });
  const [tabValue, setTabValue] = useState<string | number>('notes');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string | number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setCurrentIndex(currentIndex);
  }, [currentIndex, setCurrentIndex]);

  if (!selectedRequest) {
    return <Typography variant="h6">Loading request details...</Typography>;
  }

  return (
    <Stack>
      <RequestHeader request={selectedRequest} />
      <Paper sx={{ padding: 2 }}>
        <RequestStepper request={selectedRequest} />
      </Paper>
      <Grid container spacing={2}>
        <Grid size={{ lg: 6, md: 12 }}>
          <Stack>
            {closeoutForm && (
              <InfoPanel
                header={
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ChecklistIcon color="primary" />
                      <Typography variant="h5" component="h3" fontWeight="bold">
                        Closeout Information
                      </Typography>
                    </Stack>
                    <Button variant="outlined" onClick={() => setCloseoutDialogOpen(true)}>
                      View closeout form
                    </Button>
                  </Stack>
                }
              >
                <TableContainer>
                  <Table
                    size="small"
                    sx={{
                      '& .MuiTableCell-root:first-of-type': {
                        color: 'grey.900',
                        fontWeight: 'bold',
                        width: '205px',
                      },
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell>Submitted by Expert</TableCell>
                        <TableCell>
                          {closeoutForm?.submitted_date
                            ? formatDatetime(closeoutForm.submitted_date)
                            : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Approved by Lab</TableCell>
                        <TableCell>
                          {closeoutForm?.approved_by_lab ? <CheckIcon fontSize="small" /> : '-'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Approved by Program</TableCell>
                        <TableCell>
                          {closeoutForm?.approved_by_program ? <CheckIcon fontSize="small" /> : '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </InfoPanel>
            )}
            <RequestInfoPanel request={selectedRequest!} />
            <RequestCustomerPanel
              customer={selectedRequest.customers[0]}
              permissions={selectedRequest.permissions ?? []}
              requestId={selectedRequest.id}
            />
            <RequestOrganizationPanel
              customer={selectedRequest.customers[0]}
              permissions={selectedRequest.permissions ?? []}
              requestId={selectedRequest.id}
            />
          </Stack>
        </Grid>
        <Grid size={{ lg: 6, md: 12 }}>
          <RequestScopePanel request={selectedRequest} />
        </Grid>
        <Grid size={{ lg: 6, md: 12 }}>
          <InfoPanel
            tabs={
              <Tabs
                onChange={handleTabChange}
                value={tabValue}
                textColor="inherit"
                indicatorColor="primary"
                sx={{ '& .MuiTab-root': { fontWeight: 'bold' } }}
              >
                <Tab
                  label={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <span>Notes</span>
                      {selectedRequestNotes?.length ? (
                        <Badge badgeContent={selectedRequestNotes.length} color="primary" />
                      ) : null}
                    </Stack>
                  }
                  value="notes"
                  onClick={(event) => handleTabChange(event, 'notes')}
                />
                <Tab
                  label={
                    <Stack direction="row" spacing={2} alignItems="center">
                      <span>Attachments</span>
                      {selectedRequest.attachments?.length ? (
                        <Badge badgeContent={selectedRequest.attachments.length} color="primary" />
                      ) : null}
                    </Stack>
                  }
                  value="attachments"
                  onClick={(event) => handleTabChange(event, 'attachments')}
                />
              </Tabs>
            }
          >
            <TabPanel value={tabValue} index="notes">
              <RequestNotes
                requestId={selectedRequest.id}
                permissions={selectedRequest.permissions}
                notes={selectedRequestNotes}
              />
            </TabPanel>
            <TabPanel value={tabValue} index="attachments">
              <RequestAttachments
                requestId={selectedRequest.id}
                permissions={selectedRequest.permissions}
                attachments={selectedRequest.attachments}
              />
            </TabPanel>
          </InfoPanel>
        </Grid>
        <Grid size={{ lg: 6, md: 12 }}>
          <InfoPanel
            header={
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <HistoryIcon color="primary" />
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    Audit History
                  </Typography>
                </Stack>
              </Stack>
            }
          >
            <RequestAuditHistory auditHistoryItems={selectedRequest.audit_history} />
          </InfoPanel>
        </Grid>
      </Grid>
    </Stack>
  );
};
