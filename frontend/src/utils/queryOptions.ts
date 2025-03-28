import { queryOptions, useMutation } from "@tanstack/react-query";
import { sessionsApi } from "../api/sessions";
import { fetchListOf, IntakeFormData, submitIntake, type OrganiztionType, type State, type TransmissionPlanningRegion} from "../api/forms";

import { queryClient } from "../main"

export const authSessionQueryOptions = () => (
    queryOptions({
        queryKey: ["authSession"],
        queryFn: sessionsApi.getSession,
    })
);

export const statesQueryOptions = () => (
    queryOptions({
        queryKey: ["states"],
        queryFn: () => fetchListOf<State>(`${import.meta.env.VITE_API_URL}/states/`)
    })
);

export const organizationTypesQueryOptions = () => (
    queryOptions({
        queryKey: ["organizationTypes"],
        queryFn: () => fetchListOf<OrganiztionType>(`${import.meta.env.VITE_API_URL}/organization-types/`)
    })
);

export const transmissionPlanningRegionsQueryOptions = () => (
    queryOptions({
        queryKey: ["transmissionPlanningRegions"],
        queryFn: () => fetchListOf<TransmissionPlanningRegion>(`${import.meta.env.VITE_API_URL}/transmission-planning-regions/`)
    })
);

export const useSubmitIntakeMutation = () => {
    return useMutation({
        mutationKey: ["intake"],
        mutationFn: (formData: IntakeFormData) => submitIntake(formData),
        onSuccess: () => queryClient.invalidateQueries(),
    });
}
