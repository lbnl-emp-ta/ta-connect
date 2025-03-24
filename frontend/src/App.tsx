import {useEffect, useState} from 'react'

import './App.css'
import { MuiTelInput } from 'mui-tel-input'
import { 
        Autocomplete, 
        Button, 
        Divider, 
        FormControl, 
        FormControlLabel, 
        FormLabel, 
        InputLabel, 
        MenuItem, 
        Radio, 
        RadioGroup, 
        Select, 
        Stack, 
        Switch, 
        TextField, 
        Typography 
    } from '@mui/material';

function App() {
  return (
    <IntakeForm>
    </IntakeForm>
  )
}

function IntakeForm() {
    const [states, setStates] = useState<State[]>([]);
    const [orgTypes, setOrgTypes] = useState<OrganiztionType[]>([])
    const [tprs, setTPRs] = useState<TransmissionPlanningRegion[]>([])

    const [name, setName] = useState<string>("test name");
    const [title, setTitle] = useState<string>("test title");
    const [state, setState] = useState<State>({id:47 , name: "New York", abbreviation: "NY"});
    const [orgName, setOrgName] = useState<string>("test org name");
    const [orgAddress, setOrgAddress] = useState<string>("test org addr");
    const [email, setEmail] = useState<string>("test email");
    const [phone, setPhone] = useState<string>("999-999-9999");
    const [orgType, setOrgType] = useState<string>("Utility Commission");
    const [TADepth, setTADepth] = useState<string>("Help Desk");
    const [desc, setDesc] = useState<string>("test desc")
    const [tpr, setTPR] = useState<string>("TestTPR")

    interface State {
        id: number;
        name: string;
        abbreviation: string;
    }
    
    interface OrganiztionType {
        name: string;
        description: string;
    }
    
    interface TransmissionPlanningRegion {
        name: string;
    }

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault()
        const url = "http://127.0.0.1:8000/process-intake-form/"
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    title: title,
                    tpr: tpr,
                    state: state.abbreviation,
                    organization: orgName,
                    organizationAddress: orgAddress,
                    organizationType: orgType,
                    tadepth: TADepth,
                    description: desc
                })
            });

            if (!response.ok) {
                throw Error(`Request status: ${response.status}`);
            }

            console.log(await response.json())
        } catch (error) {
            if(error instanceof Error) {
                console.error(error.message);
            }
        }
    }

    async function fetchListOf<T>(url: string): Promise<T[] | undefined> {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw Error(`Request status: ${response.status}`);
                }
                return await response.json() as T[];
            } catch (error) {
                if(error instanceof Error) {
                    console.error("Error:", error.message);
                } else {
                    console.error("An unknown error has occured.");
                }
            }
    }

    function updateLocalListOf<T>(withCallback: Function, fromURL: string) {
        let ignore = false;

        async function startFetchingData() {
            const json = await fetchListOf<T>(fromURL);
            if(!ignore && json) {
                withCallback(json);
            }
        }

        startFetchingData()

        return () => {
            ignore = true;
        }
    }

    const handlePhoneChange = (newPhone: string) => {
        setPhone(newPhone)
    }

    useEffect(() => {
        updateLocalListOf<State>(setStates, "http://127.0.0.1:8000/states/")
    }, []);

    useEffect(() => {
        updateLocalListOf<OrganiztionType>(setOrgTypes, "http://127.0.0.1:8000/organization-types/")
    }, []);

    useEffect(() => {``
        updateLocalListOf<TransmissionPlanningRegion>(setTPRs, "http://127.0.0.1:8000/transmission-planning-regions/")
    }, []);

    return (
        <form className="intake-form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <Typography variant="h2">TA Request Form</Typography>
                <Typography id="info" variant="subtitle1">
                    Required fields are followed by <strong><span aria-label="required"> *</span></strong>
                </Typography>
                <Divider/>
                <Stack spacing={2}>
                    <Typography variant='h4'>Personal Information</Typography>
                    <TextField 
                        variant='outlined' 
                        label="First & Last Name" 
                        fullWidth={true}
                        required={true}
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                    <TextField 
                        variant='outlined' 
                        label="Email" 
                        fullWidth={true}
                        required={true}
                        onChange={e => setEmail(e.target.value)}
                        value={email}
                    />
                    <MuiTelInput 
                        variant='outlined' 
                        label="Phone Number"
                        defaultCountry="US"
                        MenuProps={{ transitionDuration: 0}}
                        focusOnSelectCountry={false}
                        fullWidth={true}
                        required={true}
                        value={phone}
                        onChange={handlePhoneChange}
                    />
                    <TextField 
                        variant='outlined' 
                        label="Title" 
                        fullWidth={true}
                        required={true}
                        onChange={e => setTitle(e.target.value)}
                        value={title}
                    />
                    <FormControl fullWidth required={true} >
                        <InputLabel id="tpr-label">Tramission Planning Region</InputLabel>
                        <Select 
                            id="tpr-select"
                            label="Tramission Planning Region"
                            labelId="tpr-label"
                            required={true}
                            defaultValue=''
                            value={
                                (tpr === undefined ||
                                tpr === null ||
                                tprs.length === 0) ? '' : tpr}
                            onChange={e => setTPR(e.target.value as React.SetStateAction<string>)}
                        >
                            {
                                tprs.map((region) => (
                                    <MenuItem key={region.name} value={region.name}>
                                        {region.name}
                                    </MenuItem>
                                ))
                            }
                        </Select> 
                    </FormControl>
                    <Autocomplete
                        disablePortal
                        options={states}
                        getOptionLabel={(option) => option.name}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} required={true} label="State" />}
                        value={state}
                        onChange={(_: any, newValue: State | null) => {
                            setState(newValue as React.SetStateAction<State>);
                        }}
                    />
                    <TextField 
                        variant='outlined' 
                        label="Organization Name" 
                        fullWidth={true}
                        required={true}
                        onChange={e => setOrgName(e.target.value)}
                        value={orgName}
                    />
                    <TextField 
                        variant='outlined' 
                        label="Organization Address" 
                        fullWidth={true}
                        required={true}
                        onChange={e => setOrgAddress(e.target.value)}
                        value={orgAddress}
                    />
                    <FormControl>
                        <FormLabel id="org-type-radio-group">Organization Type</FormLabel>
                        <RadioGroup
                            aria-labelledby="org-type-radio-group"
                            value={orgType}
                            onChange={e => setOrgType(e.target.value)}
                            name="org-type-radio-group"
                        >
                            {
                                orgTypes.map((type => (
                                    <FormControlLabel key={type.name} value={type.name} control={<Radio />} label={type.name} />
                                )))
                            }
                        </RadioGroup>
                    </FormControl>
                </Stack>
                <Divider />
                <Stack spacing={2}>
                    <Typography variant='h4'>Technical Assistance Information</Typography>
                    <FormControl>
                        <Stack spacing={2}>
                            <FormLabel id="ta-depth-radio-group">Techinical Assistance Depth</FormLabel>
                            <Typography variant='body2'>
                                What kind of Technical Assistance are you looking for? 
                                If you don't know select "Unsure".
                            </Typography> 
                        </Stack>
                        <RadioGroup
                            aria-labelledby="ta-depth-radio-group"
                            defaultValue={"Unsure"}
                            value={TADepth}
                            onChange={e => setTADepth(e.target.value)}
                            name="ta-depth-radio-group"
                        >
                            <FormControlLabel value="Help Desk" control={<Radio />} label="Help Desk" />
                            <FormControlLabel value="Expert Match" control={<Radio />} label="Expert Match" />
                            <FormControlLabel value="Unsure" control={<Radio />} label="Unsure" />
                        </RadioGroup>
                    </FormControl>
                    <FormControl>
                        <Stack spacing={2}>
                            <FormLabel id="urgency-radio-group">Urgency</FormLabel>
                            <Typography variant='body2'>
                                How urgent is this request? Please note that this is not a guarantee 
                                that Technical Assistance can be scheduled within a specific time frame.
                            </Typography> 
                        </Stack>
                        <RadioGroup
                            aria-labelledby="urgency-radio-group"
                            name="urgency-radio-group"
                            defaultValue="Unsure"
                        >
                            <FormControlLabel value="1 week" control={<Radio />} label="Within 1 week" />
                            <FormControlLabel value="1 month" control={<Radio />} label="Within 1 month" />
                            <FormControlLabel value="3 months" control={<Radio />} label="Within 3 months" />
                            <FormControlLabel value="6 months" control={<Radio />} label="Within 6 months" />
                            <FormControlLabel value="Unsure" control={<Radio />} label="Unsure" />
                        </RadioGroup>
                    </FormControl>
                    <TextField
                        label="Description"
                        placeholder='Please describe your request here (maximum of 4000 characters).'
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        multiline
                        rows={10}
                        required
                        slotProps={{htmlInput: {maxLength: 4000}}}
                    />
                </Stack>
                <Divider />
                <Stack spacing={2}>
                    <FormControl>
                        <FormControlLabel control={<Switch />} label="Send me a copy of my responses" />
                    </FormControl>
                    <Button type="submit" variant="contained">Submit</Button>
                </Stack>
            </Stack>
        </form>
    )
}


export default App