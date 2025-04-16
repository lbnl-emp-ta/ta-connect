import { queryOptions, useMutation } from "@tanstack/react-query";
import { sessionsApi } from "../api/sessions";
import { fetchListOf, IntakeFormData, submitIntakeMutation, type OrganiztionType, type State, type TransmissionPlanningRegion} from "../api/forms";

import { queryClient } from "../main"
import { signupMutation } from "../api/accounts/signup";
import { loginMutation } from "../api/accounts/login";
import { logoutMutation } from "../api/accounts/logout";
import { TARequest } from "../api/dashboard";

export const authSessionQueryOptions = () => (
    queryOptions({
        staleTime: 600_000, // stale after 10 minutes
        queryKey: ["authSession"],
        queryFn: () => sessionsApi.getSession(),
    })
);

export const requestsQueryOptions = () => (
    queryOptions({
        queryKey: ["requests"],
        queryFn: () => fetchListOf<TARequest>(`${import.meta.env.VITE_API_URL}/requests/`)
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
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["authSession"]})
        },
    })
}

export const useLogoutMutation = () => {
    return useMutation ({
        mutationFn: logoutMutation,
        onSettled: () => queryClient.invalidateQueries({queryKey: ["authSession"]}),
    })
}