import './App.css'

function App() {
  return (
    <IntakeForm>
    </IntakeForm>
  )
}

function IntakeForm() {
    return (
        <form className="intake-form" action="">
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
                    <input type="text" id="name" name="full name" required/>
                </p>
                <p>
                    <label htmlFor="title">
                        <strong>
                            <span>Title</span>
                        </strong>
                    </label>
                    <input type="text" id="title" name="job title" required/>
                </p>
                <p>
                    <label htmlFor="state">
                        <strong>
                            <span>State</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <select id="state" name='state'>
                        <option value="none"></option>
                        <option value="test1">Test 1</option>
                        <option value="test2">Test 2</option>
                        <option value="test3">Test 3</option>
                    </select>
                </p>
                <p>
                    <label htmlFor="org-name">
                        <strong>
                            <span>Organization Name</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input type="text" id="org-name" name="organization name" required/>
                </p>
                <p>
                    <label htmlFor="email">
                        <strong>
                            <span>Email</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input type="text" id="email" name="email" required/>
                </p>
                <p>
                    <label htmlFor="phone">
                        <strong>
                            <span>Phone</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </label>
                    <input type="text" id="phone" name="phone number" required/>
                </p>
                <fieldset id="org-type-fieldset">
                    <legend><strong>Organization Type</strong></legend>
                    <ul>
                        <li>
                            <label htmlFor="org_type_1">
                                <input type="radio" id='org_type_1' name="organization type" value="1"/>
                                Utility Commission
                            </label>
        
                        </li>
                        <li>
                            <label htmlFor="org_type_2">
                                <input type="radio" id='org_type_2' name="organization type" value="2"/>
                                Energy Office
                            </label>
        
                        </li>
                        <li>
                            <label htmlFor="org_type_3">
                                <input type="radio" id='org_type_3' name="organization type" value="3"/>
                                Regional State Organization
                            </label>
        
                        </li>
                    </ul>
                </fieldset>
            </section>
            <hr />
            <section>
                <h2>Technical Assistance Information</h2>
                <fieldset>
                    <legend>
                        <strong>
                            <span>Technical Assistance Type</span>
                            <span aria-label="required"> *</span>
                        </strong>
                    </legend>
                    <p>
                        What kind of Technical Assistance are you looking for? 
                        If you don't know select "Unsure".
                    </p>
                    <ul>
                        <li>
                            <label htmlFor="ta_type_1">
                                <input type="radio" id='ta_type_1' name="technical assistance type" value="1"/>
                                Help Desk
                           </label>
                        </li>
                        <li>
                            <label htmlFor="ta_type_2">
                                <input type="radio" id='ta_type_2' name="technical assistance type" value="1"/>
                                Expert Match
                           </label>
                        </li>
                        <li>
                            <label htmlFor="ta_type_3">
                                <input type="radio" id='ta_type_3' name="technical assistance type" value="1"/>
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
                        <textarea name="description" id="desc" maxLength={4000} required/>
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