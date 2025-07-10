import { queryOptions, useMutation } from '@tanstack/react-query';
import { sessionsApi } from '../api/sessions';
import { submitIntakeMutation } from '../api/forms';
import {
  IntakeFormData,
  OrganiztionType,
  State,
  TransmissionPlanningRegion,
} from '../api/forms/types';
import { signupMutation } from '../api/accounts/signup';
import { loginMutation } from '../api/accounts/login';
import { logoutMutation } from '../api/accounts/logout';
import {
  CustomerRequestRelationship,
  TAIdentity,
  TARequest,
  TARequestDetail,
  TARequestsResponse,
  TAStatus,
} from '../api/dashboard/types';
import { queryClient } from '../App';
import { Identity } from '../features/identity/IdentityContext';
import { fetchData, patchRequest } from '../api/dashboard';

export const authSessionQueryOptions = () =>
  queryOptions({
    staleTime: 300_000, // stale after 5 minutes
    queryKey: ['authSession'],
    queryFn: () => sessionsApi.getSession(),
  });

export const customerRequestRelationshipOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['customerRequestRelationships'],
    queryFn: () =>
      fetchData<CustomerRequestRelationship[]>(
        `${import.meta.env.VITE_API_URL}/customer-request-relationships/`
      ),
  });

export const identitiesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['identities'],
    queryFn: () => fetchData<TAIdentity[]>(`${import.meta.env.VITE_API_URL}/identities/`),
  });

export const requestsQueryOptions = (identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['requests', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TARequestsResponse>(`${import.meta.env.VITE_API_URL}/requests/`, identity);
      } else {
        return null;
      }
    },
  });

export const requestDetailQueryOptions = (requestId: string, identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['requests', requestId, identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TARequestDetail>(
          `${import.meta.env.VITE_API_URL}/requests/${requestId}`,
          identity
        );
      } else {
        return null;
      }
    },
  });

export const statusesQueryOptions = (identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['statuses', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TAStatus[]>(`${import.meta.env.VITE_API_URL}/statuses/`, identity);
      } else {
        return [];
      }
    },
  });

export const statesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['states'],
    queryFn: () => fetchData<State[]>(`${import.meta.env.VITE_API_URL}/states/`),
  });

export const organizationTypesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['organizationTypes'],
    queryFn: () =>
      fetchData<OrganiztionType[]>(`${import.meta.env.VITE_API_URL}/organization-types/`),
  });

export const transmissionPlanningRegionsQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['transmissionPlanningRegions'],
    queryFn: () =>
      fetchData<TransmissionPlanningRegion[]>(
        `${import.meta.env.VITE_API_URL}/transmission-planning-regions/`
      ),
  });

export const useSubmitIntakeMutation = () => {
  return useMutation({
    mutationKey: ['intake'],
    mutationFn: (formData: IntakeFormData) => submitIntakeMutation(formData),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signupMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authSession'] }),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginMutation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authSession'] }),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logoutMutation,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['authSession'] }),
  });
};

export const useRequestMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'update', requestId, identity],
    mutationFn: (data: Partial<TARequest>) => patchRequest(requestId, data, identity),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
