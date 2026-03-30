import { TARequestDetail } from '@/api/dashboard/types';
import { Step, StepLabel, Stepper } from '@mui/material';

interface RequestStepperProps {
  request?: TARequestDetail;
}

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
    } else if (request.owner?.domain_type === 'lab' && request.expert) {
      return 2;
    }
  };

  return (
    <Stepper activeStep={getActiveStep()} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
