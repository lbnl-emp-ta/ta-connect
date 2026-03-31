import { TARequestDetail } from '@/api/dashboard/types';
import { Chip, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';

interface RequestStepperProps {
  request?: TARequestDetail;
}

/**
 * Stepper to show the progress of a request through the system.
 * This is different than the status of the request, which is more granular and can be updated by users.
 * The stepper is meant to show the progression of the request through the system,
 * and is determined by the owner and status of the request.
 */
export const RequestStepper: React.FC<RequestStepperProps> = ({ request }) => {
  const steps = ['Opened', 'Reception', 'Program', 'Lab', 'Expert', 'Approval', 'Completed'];

  const getActiveStep = () => {
    if (!request) return 0;
    if (request.status === 'New' && !request.owner) {
      // This should technically never happen since we auto-assign to reception
      return 0;
    } else if (request.owner?.domain_type === 'reception') {
      return 1;
    } else if (request.owner?.domain_type === 'program' && request.lab === null) {
      return 2;
    } else if (request.owner?.domain_type === 'lab' && request.expert === null) {
      return 3;
    } else if (request.owner?.domain_type === 'expert') {
      return 4;
    } else if (request.owner?.domain_type === 'lab' && request.expert !== null) {
      return 5;
    } else if (request.owner?.domain_type === 'program' && request.expert !== null) {
      return 5;
    } else if (
      !request.owner &&
      (request.status === 'Completed' || request.status === 'Unable to address')
    ) {
      return 6;
    }
  };

  return (
    <Stepper activeStep={getActiveStep()} alternativeLabel>
      {steps.map((label, i) => (
        <Step key={label}>
          <StepLabel>
            <Stack spacing={0}>
              <Typography variant="overline" fontWeight="bold">
                {label}
              </Typography>
              {getActiveStep() === i && <Chip label={request?.status} size="small" />}
            </Stack>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
