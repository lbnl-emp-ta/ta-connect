import '../../styles.css';

import {
  Autocomplete,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  OutlinedInput,
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
} from '@/api/forms/types';
import { AppLink } from '@/components/AppLink';
import {
  organizationTypesQueryOptions,
  statesQueryOptions,
  transmissionPlanningRegionsQueryOptions,
  useSubmitIntakeMutation,
} from '@/api/queryOptions';
import { effortOptions, isValidEmail, isValidUSTelephone } from '@/utils/utils';
import { PhoneInput } from '@/components/PhoneInput';

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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [state, setState] = useState<State | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgTypeName, setOrgTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [challenges, setChallenges] = useState('');
  const [goals, setGoals] = useState('');
  const [effort, setEffort] = useState('Unsure');
  const [tprName, setTprName] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
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
      description: description,
      challenges: challenges,
      goals: goals,
      effort: effort,
    };
    submitIntakeMutation.mutate(formData);
  }

  const handlePhoneChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (isValidUSTelephone(e.target.value)) {
      setPhoneError(false);
    } else {
      setPhoneError(true);
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
                <PhoneInput
                  variant="outlined"
                  id="phone-input"
                  label="Phone Number"
                  value={phone}
                  onChange={handlePhoneChange}
                  error={phoneError}
                  required
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
                    onChange={(e) => setTprName(e.target.value)}
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
                  <FormLabel id="org-type-radio-group" sx={{ fontWeight: 'bold' }}>
                    Organization Type
                  </FormLabel>
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
                <FormControl required={true}>
                  <FormLabel htmlFor="description-input" sx={{ fontWeight: 'bold' }}>
                    Description
                  </FormLabel>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                    What is the issue/question/task you are seeking support for? (maximum of 4000
                    characters)
                  </Typography>
                  <OutlinedInput
                    id="description-input"
                    notched
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={10}
                    required
                    inputProps={{ maxLength: 4000 }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="challenges-input" sx={{ fontWeight: 'bold' }}>
                    Challenges
                  </FormLabel>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                    What challenges have you identified that DOE's technical assistance can help
                    address? (e.g. Completing this request within the next 2 months is critical to
                    meeting key deadlines) (maximum of 4000 characters)
                  </Typography>
                  <OutlinedInput
                    id="challenges-input"
                    notched
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    multiline
                    rows={10}
                    inputProps={{ maxLength: 4000 }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="goals-input" sx={{ fontWeight: 'bold' }}>
                    Goals
                  </FormLabel>
                  <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                    What do you hope to learn or accomplish through the requested technical
                    assistance (e.g. receive a report, host a workshop, support with a non-litigated
                    proceeding) (maximum of 4000 characters)
                  </Typography>
                  <OutlinedInput
                    id="goals-input"
                    notched
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    multiline
                    rows={10}
                    inputProps={{ maxLength: 4000 }}
                  />
                </FormControl>
                <FormControl required={true}>
                  <FormLabel id="effort-radio-group" sx={{ fontWeight: 'bold' }}>
                    Please estimate the level of effort to complete your request
                  </FormLabel>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block', marginBottom: 1 }}
                  >
                    <span>Please provide your best guess. </span>
                    <strong>Measure work, not calendars: </strong>
                    <span>
                      We are looking for total hands-on working hours, not the calendar duration of
                      the project. (For example, a project might take 15 days of total effort spread
                      across a 6-month period). Note: 1 day = 8 hours of work
                    </span>
                  </Typography>
                  <RadioGroup
                    value={effort}
                    onChange={(e) => setEffort(e.target.value)}
                    aria-labelledby="effort-radio-group"
                    name="effort-radio-group"
                  >
                    {effortOptions.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
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
        <Box component="footer" sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            TA Connect
          </Typography>
          <Stack direction="row" justifyContent="center" alignItems="center">
            <AppLink to="/">
              <Typography variant="body2" align="center">
                Dashboard
              </Typography>
            </AppLink>
            <Box>|</Box>
            <Link href="https://emp.lbl.gov/projects/state-TA-program" target="_blank">
              <Typography variant="body2" align="center">
                State Technical Assistance Program
              </Typography>
            </Link>
          </Stack>
          <Typography variant="body2" color="text.secondary" align="center">
            Supported by Lawrence Berkeley National Laboratory
          </Typography>
        </Box>
      </Container>
    );
  }
}
