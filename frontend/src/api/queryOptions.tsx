import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { queryOptions, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { loginMutation } from '@/api/accounts/login';
import { logoutMutation } from '@/api/accounts/logout';
import { deleteData, fetchData, patchData, postData, postForm } from '@/api/dashboard';
import {
  Customer,
  ExpertiseMutation,
  TAAssignment,
  TACloseoutForm,
  TACustomerMutation,
  TACustomerTransferMutation,
  TAExpert,
  TAIdentity,
  TANote,
  TAOwner,
  TARequestDetail,
  TARequestDetailMutation,
  TARequestsResponse,
  TAStatus,
  TATopic,
  TAUserMutation,
} from '@/api/dashboard/types';
import { submitIntakeMutation } from '@/api/forms';
import {
  IntakeFormData,
  Organization,
  OrganizationType,
  State,
  TransmissionPlanningRegion,
} from '@/api/forms/types';
import { sessionsApi } from '@/api/sessions';
import { queryClient } from '@/App';
import { useToastContext } from '@/features/toasts/ToastContext';
import { ToastMessage } from '@/features/toasts/ToastMessage';

export const apiUrl = import.meta.env.VITE_API_URL as string;

export const authSessionQueryOptions = () =>
  queryOptions({
    staleTime: 300_000, // stale after 5 minutes
    queryKey: ['authSession'],
    queryFn: () => sessionsApi.getSession(),
  });

export const customersQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['customers'],
    queryFn: () => fetchData<Customer[]>(`${apiUrl}/customers/`),
  });

export const identitiesQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['identities'],
    queryFn: () => fetchData<TAIdentity[]>(`${apiUrl}/identities/`),
  });

export const requestsQueryOptions = (isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['requests', isAdminMode],
    queryFn: () => fetchData<TARequestsResponse>(`${apiUrl}/requests/`, isAdminMode),
  });

export const requestDetailQueryOptions = (requestId: string, isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    retry: false,
    queryKey: ['requests', requestId, isAdminMode],
    queryFn: () => fetchData<TARequestDetail>(`${apiUrl}/requests/${requestId}`, isAdminMode),
  });

export const statusesQueryOptions = (isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['statuses', isAdminMode],
    queryFn: () => fetchData<TAStatus[]>(`${apiUrl}/statuses/`, isAdminMode),
  });

export const ownersQueryOptions = (requestId: string, isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['owners', isAdminMode],
    queryFn: () => fetchData<TAOwner[]>(`${apiUrl}/requests/${requestId}/owners/`, isAdminMode),
  });

export const expertsQueryOptions = (isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['experts', isAdminMode],
    queryFn: () => fetchData<TAExpert[]>(`${apiUrl}/experts/`, isAdminMode),
  });

export const topicsQueryOptions = () =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    queryKey: ['topics'],
    queryFn: () => fetchData<TATopic[]>(`${apiUrl}/topics/`),
  });

export const notesQueryOptions = (requestId: string, isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    retry: false,
    queryKey: ['requests', requestId, 'notes', isAdminMode],
    queryFn: () => fetchData<TANote[]>(`${apiUrl}/requests/${requestId}/list-notes/`, isAdminMode),
  });

export const closeoutQueryOptions = (requestId: string, isAdminMode?: boolean) =>
  queryOptions({
    staleTime: 120_000, // stale after 2 minutes
    retry: false,
    queryKey: ['requests', requestId, 'closeout-form', isAdminMode],
    queryFn: () =>
      fetchData<TACloseoutForm>(`${apiUrl}/requests/${requestId}/closeout-form/`, isAdminMode),
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

export const useUserMutation = (userId: string) => {
  return useMutation({
    mutationKey: ['users', 'update', userId],
    mutationFn: (data: Partial<TAUserMutation>) =>
      patchData<TAUserMutation>(`${import.meta.env.VITE_API_URL}/users/${userId}`, data),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useExpertiseMutation = (labRoleAssignmentId: string) => {
  return useMutation({
    mutationKey: ['expertises', 'update', labRoleAssignmentId],
    mutationFn: (data: ExpertiseMutation[]) =>
      postData(
        `${import.meta.env.VITE_API_URL}/lab-role-assignments/${labRoleAssignmentId}/expertises/`,
        data
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useCustomerTransferMutation = (requestId: string, isAdminMode?: boolean) => {
  return useMutation({
    mutationKey: ['customer', 'transfer', requestId, isAdminMode],
    mutationFn: (data: TACustomerTransferMutation) =>
      postData(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/transfer/`,
        data,
        isAdminMode
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useCustomerMutation = (customerId: string, isAdminMode?: boolean) => {
  return useMutation({
    mutationKey: ['customers', 'update', customerId, isAdminMode],
    mutationFn: (data: Partial<TACustomerMutation>) =>
      patchData<TACustomerMutation>(
        `${import.meta.env.VITE_API_URL}/customers/${customerId}`,
        data,
        isAdminMode
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useRequestMutation = (requestId: string, isAdminMode?: boolean) => {
  return useMutation({
    mutationKey: ['requests', 'update', requestId, isAdminMode],
    mutationFn: (data: Partial<TARequestDetailMutation>) =>
      patchData<TARequestDetailMutation>(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}`,
        data,
        isAdminMode
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

export const useAssignmentMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, TAAssignment, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'assign', requestId, isAdminMode],
    mutationFn: (data: TAAssignment) =>
      postData<TAAssignment>(`${apiUrl}/requests/${requestId}/assign/`, data, isAdminMode),
    ...options,
  });
};

export const useCloseoutMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, Partial<TACloseoutForm>, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'update', 'closeout-form', requestId, isAdminMode],
    mutationFn: (data: Partial<TACloseoutForm>) =>
      patchData<TACloseoutForm>(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/closeout-form/`,
        data,
        isAdminMode
      ),
    onSuccess: () => queryClient.invalidateQueries(),
    ...options,
  });
};

export const useCreateCloseoutMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'create', 'closeout-form', requestId, isAdminMode],
    mutationFn: () =>
      postData(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/closeout-form/`,
        null,
        isAdminMode
      ),
    ...options,
  });
};

export const useSubmitCloseoutMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'submit', 'closeout-form', requestId, isAdminMode],
    mutationFn: () =>
      postData(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/submit-closeout-form/`,
        null,
        isAdminMode
      ),
    ...options,
  });
};

export const useApproveCloseoutByLabMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'approve-by-lab', 'closeout-form', requestId, isAdminMode],
    mutationFn: () =>
      postData(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/approve-closeout-form-by-lab/`,
        null,
        isAdminMode
      ),
    ...options,
  });
};

export const useApproveCloseoutByProgramMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'approve-by-program', 'closeout-form', requestId, isAdminMode],
    mutationFn: () =>
      postData(
        `${import.meta.env.VITE_API_URL}/requests/${requestId}/approve-closeout-form-by-program/`,
        null,
        isAdminMode
      ),
    ...options,
  });
};

export const useCancelMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'cancel', requestId, isAdminMode],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/cancel/`, null, isAdminMode),
    ...options,
  });
};

export const useFinishCloseoutMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'finish-closeout', requestId, isAdminMode],
    mutationFn: () =>
      postData(`${apiUrl}/requests/${requestId}/closeout-complete/`, null, isAdminMode),
    ...options,
  });
};

export const useReopenMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, void, unknown>
) => {
  return useMutation({
    mutationKey: ['requests', 'reopen', requestId, isAdminMode],
    mutationFn: () => postData(`${apiUrl}/requests/${requestId}/reopen/`, null, isAdminMode),
    ...options,
  });
};

export const useAttachmentMutation = (
  requestId: string,
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, FormData, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'upload-attachment', requestId, isAdminMode],
    mutationFn: (formData: FormData) =>
      postForm(`${apiUrl}/requests/${requestId}/upload-attachment/`, formData, isAdminMode),
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
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, string, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'delete-attachment', requestId, isAdminMode],
    mutationFn: (attachmentId: string) =>
      deleteData(`${apiUrl}/requests/${requestId}/delete-attachment/${attachmentId}/`, isAdminMode),
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
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, Partial<TANote>, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'add-note', requestId, isAdminMode],
    mutationFn: (data: Partial<TANote>) =>
      postData(`${apiUrl}/requests/${requestId}/add-note/`, data, isAdminMode),
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
  isAdminMode?: boolean,
  options?: UseMutationOptions<unknown, Error, string, unknown>
) => {
  const { setShowToast, setToastMessage } = useToastContext();
  return useMutation({
    mutationKey: ['requests', 'add-note', requestId, isAdminMode],
    mutationFn: (noteId: string) =>
      deleteData(`${apiUrl}/requests/${requestId}/delete-note/${noteId}/`, isAdminMode),
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
