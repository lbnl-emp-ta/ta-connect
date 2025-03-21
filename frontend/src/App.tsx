import {useEffect, useState} from 'react'
import './App.css'

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
    const [stateAbbr, setStateAbbr] = useState<string>("NY");
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
                    state: stateAbbr,
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

    function updateEffectListOf<T>(withCallback: Function, fromURL: string) {
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

    useEffect(() => {
        updateEffectListOf<State>(setStates, "http://127.0.0.1:8000/states/")
    }, []);

    useEffect(() => {
        updateEffectListOf<OrganiztionType>(setOrgTypes, "http://127.0.0.1:8000/organization-types/")
    }, []);

    useEffect(() => {``
        updateEffectListOf<TransmissionPlanningRegion>(setTPRs, "http://127.0.0.1:8000/transmission-planning-regions/")
    }, []);

    return (
        <form className="intake-form" onSubmit={handleSubmit}>
            <h1>TA Request Form</h1>
            <p id="info">
                Required fields are followed by <strong><span aria-label="required"> *</span></strong>
            </p>
            <section>
                <h2>Personal Information</h2>
                <p>
                    <label htmlFor="name">
                        <strong>
                            <span>First & Last Name</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        type="text" 
                        id="name" 
                        name="full name" 
                        required
                        />
                </p>
                <p>
                    <label htmlFor="email">
                        <strong>
                            <span>Email</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input  
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="text" 
                        id="email" 
                        name="email" 
                        required/>
                </p>
                <p>
                    <label htmlFor="phone">
                        <strong>
                            <span>Phone</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        type="text" 
                        id="phone" 
                        name="phone number" 
                        required/>
                </p>
                <p>
                    <label htmlFor="title">
                        <strong>
                            <span>Title</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        type="text" 
                        id="title" 
                        name="job title" 
                        required/>
                </p>
                <p>
                    <label htmlFor="tpr">
                        <strong>
                            <span>Tramission Planning Region</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <select id="tpr" name='transmission planning region' onChange={e => setTPR(e.target.value)}>
                        <option value="none"></option>
                        {
                            tprs.map((region) => (
                                <option key={region.name} value={region.name}>{region.name}</option>
                            ))
                        }
                    </select>
                </p>
                <p>
                    <label htmlFor="state">
                        <strong>
                            <span>State</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <select id="state" name='state' onChange={e => setStateAbbr(e.target.value)}>
                        <option value="none"></option>
                        {
                            states.map((state) => (
                                <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                            ))
                        }
                    </select>
                </p>
                <p>
                    <label htmlFor="org-name">
                        <strong>
                            <span>Organization Name</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input value={orgName} onChange={e => setOrgName(e.target.value)} type="text" id="org-name" name="organization name" required/>
                </p>
                <p>
                    <label htmlFor="org-address">
                        <strong>
                            <span>Organization Address</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input value={orgAddress} onChange={e => setOrgAddress(e.target.value)} type="text" id="org-address" name="organization address" required/>
                </p>
                <fieldset id="org-type-fieldset">
                    <legend>
                        <strong>
                            <span>Organization Type</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </legend>
                    <ul>
                        {
                            orgTypes.map((type) => (
                                <li key={type.name}>
                                    <label htmlFor={`${type.name}-radio`}>
                                        <input 
                                            onChange={e => setOrgType(e.target.value)}
                                            type="radio" 
                                            id={`${type.name}-radio`} 
                                            name="organization type" 
                                            value={type.name}/>
                                        {type.name}
                                    </label>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>
            </section>
            <hr />
            <section>
                <h2>Technical Assistance Information</h2>
                <fieldset>
                    <legend>
                        <strong>
                            <span>Technical Assistance Depth</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </legend>
                    <p>
                        What kind of Technical Assistance are you looking for? 
                        If you don't know select "Unsure".
                    </p>
                    <ul>
                        <li>
                            <label htmlFor="ta_depth_1">
                                <input 
                                    onChange={e => setTADepth(e.target.value)}
                                    type="radio" 
                                    id='ta_depth_1' 
                                    name="technical assistance depth" 
                                    value="Help Desk"/>
                                Help Desk
                           </label>
                        </li>
                        <li>
                            <label htmlFor="ta_depth_2">
                                <input 
                                    onChange={e => setTADepth(e.target.value)}
                                    type="radio" 
                                    id='ta_depth_2' 
                                    name="technical assistance depth" 
                                    value="Expert Match"/>
                                Expert Match
                           </label>
                        </li>
                        <li>
                            <label htmlFor="ta_depth_3">
                                <input 
                                    onChange={e => setTADepth(e.target.value)}
                                    type="radio" 
                                    id='ta_depth_3' 
                                    name="technical assistance depth" 
                                    value="Unsure"/>
                                Unsure
                           </label>
                        </li>
                    </ul>
                </fieldset>
                <fieldset>
                    <legend><strong>Urgency</strong></legend>
                    <p>
                        How urgent is this request? Please note that this is not a guarantee 
                        that Technical Assistance can be scheduled within a specific time frame.
                    </p>
                    <ul>
                        <li>
                            <label htmlFor="urgency_1">
                                <input type="radio" id='urgency_1' name="urgency" value="1"/>
                                Within 1 week
                           </label>
                        </li>
                        <li>
                            <label htmlFor="urgency_2">
                                <input type="radio" id='urgency_2' name="urgency" value="2"/>
                                Within 1 month
                           </label>
                        </li>
                        <li>
                            <label htmlFor="urgency_3">
                                <input type="radio" id='urgency_3' name="urgency" value="3"/>
                                Within 3 month
                           </label>
                        </li>
                        <li>
                            <label htmlFor="urgency_4">
                                <input type="radio" id='urgency_4' name="urgency" value="4"/>
                                Within 6 month
                           </label>
                        </li>
                        <li>
                            <label htmlFor="urgency_5">
                                <input type="radio" id='urgency_5' name="urgency" value="5"/>
                                Unsure
                           </label>
                        </li>
                    </ul>
                </fieldset>
                <fieldset>
                    <legend>
                        <label htmlFor="desc">
                        <strong>
                            <span>Description</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    </legend>
                    <p>
                        Please describe the Technical Assistance you are looking to receive. 
                        Please provide as much detail as possible.
                    </p>
                    <p>
                        <i>This field is limited to 4000 characters.</i>
                    </p>
                    <p>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)} 
                            name="description" 
                            id="desc" 
                            maxLength={4000} required/>
                    </p>
                </fieldset>
            </section>
            <hr />
            <section>
                <label htmlFor="copy-email">
                    <input type="checkbox" id='copy-email' name="send copy of email" value="1"/>
                    Send me a copy of my responses
                </label>
                <p>
                    <button type="submit">Submit</button>
                </p>
            </section>
        </form>
    )
}


export default App