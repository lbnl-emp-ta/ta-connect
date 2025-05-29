import { getCSRFToken } from "../../../utils/cookies";
import { ErrorResponse, SessionUnauthenticatedResponse } from "../../types";

export async function logoutMutation() {
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/_allauth/browser/v1/auth/session`,
            {
                method: "DELETE",
                credentials: "include",
                headers: { 
                    "X-CSRFToken": getCSRFToken() || "" 
                },
            },
        );
    
        const responseData = await response.json() as (SessionUnauthenticatedResponse | ErrorResponse);
    
        if (!response.ok) {
            throw Error(`Error: Status ${response.status}`);
        }
    
        return responseData;
} 