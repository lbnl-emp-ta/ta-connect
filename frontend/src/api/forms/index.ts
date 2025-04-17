import { getCSRFToken } from "../../utils/cookies";

export interface State {
    id: number;
    name: string;
    abbreviation: string;
}

export interface OrganiztionType {
    name: string;
    description: string;
}

export interface TransmissionPlanningRegion {
    name: string;
}

export interface IntakeFormData {
    name: string;
    email: string;
    phone: string;
    title: string;
    tpr: string;
    state: string;
    organization: string;
    organizationAddress: string;
    organizationType: string;
    taDepth: string;
    description: string;
}

export async function fetchListOf<T>(url: string): Promise<T[]> {
    try {
        const response = await fetch(url, {
            credentials: "include"
        });
        if (!response.ok) {
            throw Error(`Request status: ${response.status}`);
        }
        return await response.json() as T[];
    } catch (error) {
        let message;
        if(error instanceof Error) {
            message = error.message;
        } else {
            message = "An unknown error has occured.";
        }
        throw Error(`Error: ${message}`)
    }
}

export async function submitIntakeMutation(formData: IntakeFormData) {
    const url = `${import.meta.env.VITE_API_URL}/process-intake-form/`
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken() || ""
            },
            body: JSON.stringify({...formData})
        });

        if (!response.ok) {
            throw Error(`Request status: ${response.status}`);
        }
    } catch (error) {
        if(error instanceof Error) {
            console.error(error.message);
        }
    }
}