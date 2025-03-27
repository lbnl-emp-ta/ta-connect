import { getCSRFToken } from "../../../utils/cookies"

export async function signupMutation(details: {
    email: string;
    password1: string;
    password2: string;
}) {
    await fetch (
        `${import.meta.env.VITE_API_URL}/_allauth/browser/v1/auth/signup`,
        {
            method: "POST",
            credentials: "include",
            headers: { 
                'Content-Type': 'application/json',
                "X-CSRFToken": getCSRFToken() || "",
            },
            body: JSON.stringify(details),
        },
    );
}