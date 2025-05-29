import { getCSRFToken } from "../../../utils/cookies"
import { ErrorResponse, SessionAuthenticatedResponse } from "../../types";
import { SignupDetails } from "./types";

export async function signupMutation(details: SignupDetails) {
    const response = await fetch (
        `${import.meta.env.VITE_API_URL}/_allauth/browser/v1/auth/signup`,
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

    const responseData = await response.json() as (SessionAuthenticatedResponse | ErrorResponse);

    if (!response.ok) {
        throw Error(`Error: Status ${response.status}`);
    }

    return responseData;
}