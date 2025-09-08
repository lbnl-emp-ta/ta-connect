import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { queryOptions, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { loginMutation } from '../api/accounts/login';
import { logoutMutation } from '../api/accounts/logout';
import { signupMutation } from '../api/accounts/signup';
import { deleteData, fetchData, patchData, postData, postForm } from '../api/dashboard';
import {
  CustomerRequestRelationship,
  TAAssignment,
  TACustomerMutation,
  TAExpert,
  TAIdentity,
  TANote,
  TAOwner,
  TARequestDetail,
  TARequestDetailMutation,
  TARequestsResponse,
  TAStatus,
  TATopic,
} from '../api/dashboard/types';
import { submitIntakeMutation } from '../api/forms';
import {
  IntakeFormData,
  Organization,
  OrganizationType,
  State,
  TransmissionPlanningRegion,
} from '../api/forms/types';
import { sessionsApi } from '../api/sessions';
import { queryClient } from '../App';
import { Identity } from '../features/identity/IdentityContext';
import { useToastContext } from '../features/toasts/ToastContext';
import { ToastMessage } from '../features/toasts/ToastMessage';

export const apiUrl = import.meta.env.VITE_API_URL as string;

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

export const expertsQueryOptions = (identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['experts', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TAExpert[]>(`${apiUrl}/experts/`, identity);
      } else {
        return [];
      }
    },
  });

export const topicsQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['topics'],
    queryFn: () => {
      return fetchData<TATopic[]>(`${apiUrl}/topics/`);
    },
  });

export const notesQueryOptions = (requestId: string, identity?: Identity) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    retry: false,
    queryKey: ['requests', requestId, 'notes', identity],
    queryFn: () => {
      if (identity) {
        return fetchData<TANote[]>(`${apiUrl}/requests/${requestId}/list-notes/`, identity);
      } else {
        return null;
      }
    },
  });

export const statesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['states'],
    queryFn: () => fetchData<State[]>(`${apiUrl}/states/`),
  });

export const organizationQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['organization'],
    queryFn: () => fetchData<Organization[]>(`${apiUrl}/organizations/`),
  });

export const organizationTypesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['organizationTypes'],
    queryFn: () => fetchData<OrganizationType[]>(`${apiUrl}/organization-types/`),
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

export const useCustomerMutation = (customerId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['customers', 'update', customerId, identity],
    mutationFn: (data: Partial<TACustomerMutation>) =>
      patchData<TACustomerMutation>(
        `${import.meta.env.VITE_API_URL}/customers/${customerId}`,
        data,
        identity
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useRequestMutation = (requestId: string, identity?: Identity) => {
  return useMutation({
    mutationKey: ['requests', 'update', requestId, identity],
    mutationFn: (data: Partial<TARequestDetailMutation>) =>
      patchData<TARequestDetailMutation>(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}`,
        data,
        identity
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useAssignmentMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, TAAssignment, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'assign', requestId, identity],
    mutationFn: (data: TAAssignment) =>
      postData<TAAssignment>(`${apiUrl}/requests/assign/`, data, identity),
    ...options,
  });
};

export const useMarkCompleteMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'mark-complete', requestId, identity],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/mark-complete/`, null, identity),
    ...options,
  });
};

export const useCancelMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'cancel', requestId, identity],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/cancel/`, null, identity),
    ...options,
  });
};

export const useFinishCloseoutMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'finish-closeout', requestId, identity],
    mutationFn: () =>
      postData(`${apiUrl}/requests/${requestId}/closeout-complete/`, null, identity),
    ...options,
  });
};

export const useAttachmentMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, FormData, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'upload-attachment', requestId, identity],
    mutationFn: (formData: FormData) =>
      postForm(`${apiUrl}/requests/${requestId}/upload-attachment/`, formData, identity),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Added attachment to request</ToastMessage>
      );
    },
    onError: (error: Error) => {
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
    },
    ...options,
  });
};

export const useDeleteAttachmentMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, string, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'delete-attachment', requestId, identity],
    mutationFn: (attachmentId: string) =>
      deleteData(`${apiUrl}/requests/${requestId}/delete-attachment/${attachmentId}/`, identity),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Deleted attachment from request</ToastMessage>
      );
    },
    onError: (error: Error) => {
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
    },
    ...options,
  });
};

export const useCreateNoteMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, Partial<TANote>, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'add-note', requestId, identity],
    mutationFn: (data: Partial<TANote>) =>
      postData(`${apiUrl}/requests/${requestId}/add-note/`, data, identity),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Added note to request</ToastMessage>
      );
    },
    onError: (error: Error) => {
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
    },
    ...options,
  });
};

export const useDeleteNoteMutation = (
  requestId: string,
  identity?: Identity,
  options?: UseMutationOptions<unknown, Error, string, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'add-note', requestId, identity],
    mutationFn: (noteId: string) =>
      deleteData(`${apiUrl}/requests/${requestId}/delete-note/${noteId}/`, identity),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowToast(true);
      setToastMessage(
        <ToastMessage icon={<CheckCircleIcon />}>Deleted note from request</ToastMessage>
      );
    },
    onError: (error: Error) => {
      setShowToast(true);
      setToastMessage(<ToastMessage icon={<ErrorIcon />}>{error.message}</ToastMessage>);
    },
    ...options,
  });
};
