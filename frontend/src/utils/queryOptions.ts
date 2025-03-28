import { queryOptions, useMutation } from "@tanstack/react-query";
import { sessionsApi } from "../api/sessions";
import { fetchListOf, IntakeFormData, submitIntakeMutation, type OrganiztionType, type State, type TransmissionPlanningRegion} from "../api/forms";

import { queryClient } from "../main"
import { signupMutation } from "../api/accounts/signup";
import { loginMutation } from "../api/accounts/login";

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
        mutationFn: (formData: IntakeFormData) => submitIntakeMutation(formData),
        onSuccess: () => queryClient.invalidateQueries(),
    });
}

export const useSigupMutation = () => {
    return useMutation ({
        mutationFn: signupMutation,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["authSession"]})
    });
}

export const useLoginMutation = () => {
    return useMutation ({
        mutationFn: loginMutation,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["authSession"]})
    })
}