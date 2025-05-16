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