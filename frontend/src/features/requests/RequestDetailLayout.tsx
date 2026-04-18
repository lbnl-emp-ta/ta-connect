import { InfoPanel } from '@/components/InfoPanel';
import { TabPanel } from '@/components/TabPanel';
import { useIdentityContext } from '@/features/identity/IdentityContext';
import { RequestAttachments } from '@/features/requests/RequestAttachments';
import { RequestAuditHistory } from '@/features/requests/RequestAuditHistory';
import { RequestCustomerPanel } from '@/features/requests/RequestCustomerPanel';
import { RequestHeader } from '@/features/requests/RequestHeader';
import { RequestInfoPanel } from '@/features/requests/RequestInfoPanel';
import { RequestNotes } from '@/features/requests/RequestNotes';
import { useRequestsContext } from '@/features/requests/RequestsContext';
import { RequestStepper } from '@/features/requests/RequestStepper';
import { notesQueryOptions, requestDetailQueryOptions } from '@/utils/queryOptions';
import { Badge, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface RequestDetailLayoutProps {
  requestId: string;
}

export const RequestDetailLayout: React.FC<RequestDetailLayoutProps> = ({ requestId }) => {
  const { identity } = useIdentityContext();
  const { data: selectedRequest } = useSuspenseQuery(
    requestDetailQueryOptions(requestId, identity)
  );
  const { data: selectedRequestNotes } = useSuspenseQuery(notesQueryOptions(requestId, identity));
  const { sortedRequestsMap, selectedListId, setCurrentIndex } = useRequestsContext();
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
          <RequestInfoPanel request={selectedRequest!} />
        </Grid>
        <Grid size={{ lg: 6, md: 12 }}>
          <Stack>
            <RequestCustomerPanel customer={selectedRequest?.customers[0]} />
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
                          <Badge
                            badgeContent={selectedRequest.attachments.length}
                            color="primary"
                          />
                        ) : null}
                      </Stack>
                    }
                    value="attachments"
                    onClick={(event) => handleTabChange(event, 'attachments')}
                  />
                  <Tab
                    label="Audit History"
                    value="audit-history"
                    onClick={(event) => handleTabChange(event, 'audit-history')}
                  />
                </Tabs>
              }
            >
              <TabPanel value={tabValue} index="notes">
                <RequestNotes requestId={selectedRequest.id} notes={selectedRequestNotes} />
              </TabPanel>
              <TabPanel value={tabValue} index="attachments">
                <RequestAttachments
                  requestId={selectedRequest.id}
                  attachments={selectedRequest.attachments}
                />
              </TabPanel>
              <TabPanel value={tabValue} index="audit-history">
                <RequestAuditHistory auditHistoryItems={selectedRequest.audit_history} />
              </TabPanel>
            </InfoPanel>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};
