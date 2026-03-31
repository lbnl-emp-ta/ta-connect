import { TARequestDetail } from '@/api/dashboard/types';
import { getStep, Steps } from '@/utils/utils';
import { Chip, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';

interface RequestStepperProps {
  request: TARequestDetail;
}

/**
 * Stepper to show the progress of a request through the system.
 * This is different than the status of the request, which is more granular and can be updated by users.
 * The stepper is meant to show the progression of the request through the system,
 * and is determined by the owner and status of the request.
 */
export const RequestStepper: React.FC<RequestStepperProps> = ({ request }) => {
  const steps = Object.keys(Steps);

  return (
    <Stepper activeStep={getStep(request).stepIndex} alternativeLabel>
      {steps.map((label, i) => (
        <Step key={label}>
          <StepLabel>
            <Stack spacing={0}>
              <Typography variant="overline" fontWeight="bold">
                {label}
              </Typography>
              {getStep(request).stepIndex === i && <Chip label={request.status} size="small" />}
            </Stack>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
