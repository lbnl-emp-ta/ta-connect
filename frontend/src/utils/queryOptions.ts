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
  TAAssignment,
  TAExpert,
  TAIdentity,
  TAOwner,
  TARequest,
  TARequestDetail,
  TARequestsResponse,
  TAStatus,
} from '../api/dashboard/types';
import { queryClient } from '../App';
import { Identity } from '../features/identity/IdentityContext';
import { fetchData, patchRequest, postData } from '../api/dashboard';

const apiUrl = import.meta.env.VITE_API_URL as string;

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
      fetchData<CustomerRequestRelationship[]>(`${apiUrl}/customer-request-relationships/`),
  });

export const identitiesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['identities'],
    queryFn: () => fetchData<TAIdentity[]>(`${apiUrl}/identities/`),
  });

export const requestsQueryOptions = (identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['requests', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TARequestsResponse>(`${apiUrl}/requests/`, identity);
      } else {
        return null;
      }
    },
  });

export const requestDetailQueryOptions = (requestId: string, identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    retry: false,
    queryKey: ['requests', requestId, identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TARequestDetail>(`${apiUrl}/requests/${requestId}`, identity);
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
        return fetchData<TAStatus[]>(`${apiUrl}/statuses/`, identity);
      } else {
        return [];
      }
    },
  });

export const ownersQueryOptions = (identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['owners', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TAOwner[]>(`${apiUrl}/owners/`, identity);
      } else {
        return [];
      }
    },
  });

export const expertsQueryOptions = (labName: string | null, identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['experts', labName, identity],
    queryFn: () => {
      if (identity && labName) {
        return fetchData<TAExpert[]>(`${apiUrl}/experts/${labName}`, identity);
      } else {
        return [];
      }
    },
  });

export const statesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['states'],
    queryFn: () => fetchData<State[]>(`${apiUrl}/states/`),
  });

export const organizationTypesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['organizationTypes'],
    queryFn: () => fetchData<OrganiztionType[]>(`${apiUrl}/organization-types/`),
  });

export const transmissionPlanningRegionsQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['transmissionPlanningRegions'],
    queryFn: () =>
      fetchData<TransmissionPlanningRegion[]>(`${apiUrl}/transmission-planning-regions/`),
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

export const useAssignmentMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'assign', requestId, identity],
    mutationFn: (data: TAAssignment) =>
      postData<TAAssignment>(`${apiUrl}/requests/assign/`, data, identity),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useMarkCompleteMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'mark-complete', requestId, identity],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/mark-complete/`, null, identity),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useCancelMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'cancel', requestId, identity],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/cancel/`, null, identity),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useFinishCloseoutMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'finish-closeout', requestId, identity],
    mutationFn: () =>
      postData(`${apiUrl}/requests/${requestId}/closeout-complete/`, null, identity),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
