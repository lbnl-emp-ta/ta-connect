import '../../styles.css';

import {
  Autocomplete,
  Button,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';

import { useSuspenseQuery } from '@tanstack/react-query';
import { ChangeEventHandler, useEffect, useState } from 'react';
import {
  IntakeFormData,
  OrganizationType,
  State,
  TransmissionPlanningRegion,
} from '../../api/forms/types';
import { AppLink } from '../../components/AppLink';
import {
  organizationTypesQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useSubmitIntakeMutation,
} from '../../utils/queryOptions';
import { isValidEmail, isValidUSTelephone } from '../../utils/utils';

export const Route = createFileRoute('/(public)/intake')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(statesQueryOptions());
    await context.queryClient.ensureQueryData(organizationTypesQueryOptions());
    await context.queryClient.ensureQueryData(transmissionPlanningRegionsQueryOptions());
  },
  component: IntakeForm,
});

function IntakeForm() {
  const { data: states } = useSuspenseQuery(statesQueryOptions());
  const { data: orgTypes } = useSuspenseQuery(organizationTypesQueryOptions());
  const { data: tprs } = useSuspenseQuery(transmissionPlanningRegionsQueryOptions());

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const [state, setState] = useState<State | null>(null);

  const [orgName, setOrgName] = useState<string>('');
  const [orgAddress, setOrgAddress] = useState<string>('');
  const [orgTypeName, setOrgTypeName] = useState<string>('');

  const [desc, setDesc] = useState<string>('');

  const [tprName, setTPRName] = useState<string>('');

  const [phoneError, setPhoneError] = useState<boolean>(false);
  const [phoneHelperText, setPhoneHelperText] = useState<string>('');

  const [emailError, setEmailError] = useState<boolean>(false);
  const [emailHelperText, setEmailHelperText] = useState<string>('');

  const submitIntakeMutation = useSubmitIntakeMutation();

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData: IntakeFormData = {
      name: name,
      email: email,
      phone: phone,
      title: title,
      tpr: tprName,
      state: state?.abbreviation || '',
      organization: orgName,
      organizationAddress: orgAddress,
      organizationType: orgTypeName,
      description: desc,
    };
    submitIntakeMutation.mutate(formData);
  }

  const handlePhoneChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (isValidUSTelephone(e.target.value)) {
      setPhoneError(false);
      setPhoneHelperText('');
    } else {
      setPhoneError(true);
      setPhoneHelperText('Not a valid phone number.');
    }

    setPhone(e.target.value);
  };

  const handleEmailChange = (newEmail: string) => {
    const isValid = isValidEmail(newEmail);
    setEmailError(!isValid);
    setEmailHelperText(isValid ? '' : 'Not a valid email address.');
    setEmail(newEmail);
  };

  useEffect(() => {
    document.title = 'TA Connect - Intake Form';
  }, []);

  if (submitIntakeMutation.status !== 'idle') {
    return (
      <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
        <Paper sx={{ padding: 8, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Typography>Form submitted!</Typography>
            <Typography>
              Look out for emails from taconnect@lbl.gov on the status of your request.
            </Typography>
            <AppLink to="/intake" reloadDocument>
              Submit another TA request
            </AppLink>
          </Stack>
        </Paper>
      </Container>
    );
  } else {
    return (
      <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
        <Paper sx={{ padding: 2 }}>
          <form className="intake-form form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Typography variant="h2">TA Request Form</Typography>
              <Typography>
                As a reminder, this program is limited to State PUCs and SEOs only. Employees at
                these State organizations can submit an unlimited number of Help Desk and Expert
                Match requests. Use this form to submit a request for State Technical Assistance.
                Please email TA3@lbl.gov regarding the status of any existing requests or
                submissions.
              </Typography>
              <Typography id="info" variant="subtitle1">
                Required fields are followed by{' '}
                <strong>
                  <span aria-label="required"> *</span>
                </strong>
              </Typography>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="h4">Personal Information</Typography>
                <TextField
                  variant="outlined"
                  label="First & Last Name"
                  fullWidth={true}
                  required={true}
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                <TextField
                  variant="outlined"
                  label="Email"
                  fullWidth={true}
                  required={true}
                  error={emailError}
                  helperText={emailHelperText}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  value={email}
                />
                <TextField
                  variant="outlined"
                  label="Phone Number"
                  fullWidth={true}
                  required={true}
                  value={phone}
                  error={phoneError}
                  helperText={phoneHelperText}
                  onChange={handlePhoneChange}
                />
                <TextField
                  variant="outlined"
                  label="Job Title"
                  fullWidth={true}
                  required={true}
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                />
                <FormControl fullWidth required={true}>
                  <InputLabel id="tpr-label">Tramission Planning Region</InputLabel>
                  <Select
                    id="tpr-select"
                    label="Tramission Planning Region"
                    labelId="tpr-label"
                    required={true}
                    defaultValue=""
                    value={
                      tprName === undefined || tprName === null || tprs?.length === 0 ? '' : tprName
                    }
                    onChange={(e) => setTPRName(e.target.value as React.SetStateAction<string>)}
                  >
                    {tprs?.map((region: TransmissionPlanningRegion) => (
                      <MenuItem key={region.name} value={region.name}>
                        {region.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Autocomplete
                  disablePortal
                  options={states || []}
                  getOptionLabel={(option: State) => option.name}
                  sx={{ width: 300 }}
                  renderInput={(params) => <TextField {...params} required={true} label="State" />}
                  value={state}
                  onChange={(_, newValue: State | null) => {
                    setState(newValue);
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Organization Name"
                  fullWidth={true}
                  required={true}
                  onChange={(e) => setOrgName(e.target.value)}
                  value={orgName}
                />
                <TextField
                  variant="outlined"
                  label="Organization Address"
                  fullWidth={true}
                  required={true}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  value={orgAddress}
                />
                <FormControl>
                  <FormLabel id="org-type-radio-group">Organization Type</FormLabel>
                  <RadioGroup
                    aria-labelledby="org-type-radio-group"
                    value={orgTypeName}
                    onChange={(e) => setOrgTypeName(e.target.value)}
                    name="org-type-radio-group"
                  >
                    {orgTypes?.map((type: OrganizationType) => (
                      <FormControlLabel
                        key={type.name}
                        value={type.name}
                        control={<Radio />}
                        label={type.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Stack>
              <Divider />
              <Stack spacing={2}>
                <Typography variant="h4">Technical Assistance Information</Typography>
                <FormControl>
                  <Stack spacing={2}>
                    <FormLabel id="urgency-radio-group">Urgency</FormLabel>
                    <Typography variant="body2">
                      How urgent is this request? Please note that this is not a guarantee that
                      Technical Assistance can be scheduled within a specific time frame.
                    </Typography>
                  </Stack>
                  <RadioGroup aria-labelledby="urgency-radio-group" name="urgency-radio-group">
                    <FormControlLabel value="1 week" control={<Radio />} label="Within 1 week" />
                    <FormControlLabel value="1 month" control={<Radio />} label="Within 1 month" />
                    <FormControlLabel
                      value="3 months"
                      control={<Radio />}
                      label="Within 3 months"
                    />
                    <FormControlLabel
                      value="6 months"
                      control={<Radio />}
                      label="Within 6 months"
                    />
                    <FormControlLabel value="Unsure" control={<Radio />} label="Unsure" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label="Description"
                  placeholder="Please describe your request here (maximum of 4000 characters)."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  multiline
                  rows={10}
                  required
                  slotProps={{ htmlInput: { maxLength: 4000 } }}
                />
              </Stack>
              <Divider />
              <Stack spacing={2}>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </Stack>
            </Stack>
          </form>
        </Paper>
      </Container>
    );
  }
}
