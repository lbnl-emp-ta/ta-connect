import { getCSRFToken } from "../../../utils/cookies"
import { SignupDetails } from "./types";

export async function signupMutation(details: SignupDetails) {
    const response = await fetch ("/_allauth/browser/v1/auth/signup",
        {
            method: "POST",
            credentials: "include",
            headers: { 
                'Content-Type': 'application/json',
                "X-CSRFToken": getCSRFToken() || "",
            },
            body: JSON.stringify({...details}),
        },
    );

    const responseData = await response.json();

    if (!response.ok) {
        throw Error(`Error: Status ${response.status}`);
    }

    return responseData;
}