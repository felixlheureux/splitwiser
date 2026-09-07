import {
  ApiError,
  apiRoutes,
  type AddMemberInput,
  type CreateExpenseInput,
  type Expense,
  type Group,
  type GroupCreate,
  type GroupDetail,
  type GroupsResponse,
  type JoinGroupInput,
  type Me,
  type Member,
  type ProfileUpdate,
} from '@splitwiser/shared';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import { request } from './request';

export const apiKeys = {
  profile: ['profile'] as const,
  groups: {
    all: ['groups'] as const,
    list: (userId: string) => ['groups', 'list', userId] as const,
    detail: (groupId: string) => ['groups', 'detail', groupId] as const,
    join: (code: string) => ['groups', 'join', code] as const,
  },
};

export function createAPI(queryClient: QueryClient, appOrigin: string) {
  function expireSession() {
    queryClient.removeQueries({ queryKey: apiKeys.groups.all });
    queryClient.setQueryData(apiKeys.profile, null);
  }

  async function authenticatedRequest<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      return await request<T>(path, options);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) expireSession();
      throw error;
    }
  }

  return {
    routes: apiRoutes,
    keys: apiKeys,
    profile: {
      get: () =>
        queryOptions({
          queryKey: apiKeys.profile,
          queryFn: async ({ signal }): Promise<Me | null> => {
            try {
              const user = await request<Me>(apiRoutes.profile, { signal });
              const previous = queryClient.getQueryData<Me | null>(apiKeys.profile);
              if (previous?.id !== user.id) queryClient.removeQueries({ queryKey: apiKeys.groups.all });
              return user;
            } catch (error) {
              if (error instanceof ApiError && error.status === 401) {
                queryClient.removeQueries({ queryKey: apiKeys.groups.all });
                return null;
              }
              throw error;
            }
          },
          retry: false,
          staleTime: 0,
          refetchOnWindowFocus: 'always',
        }),
      update: () =>
        mutationOptions({
          mutationKey: ['profile', 'update'],
          mutationFn: (input: ProfileUpdate) =>
            authenticatedRequest<Me>(apiRoutes.profile, {
              method: 'PATCH',
              body: JSON.stringify(input),
            }),
          onSuccess: (user) => {
            if (queryClient.getQueryData<Me | null>(apiKeys.profile)?.id === user.id) {
              queryClient.setQueryData(apiKeys.profile, user);
            }
          },
        }),
    },
    groups: {
      list: (userId: string) =>
        queryOptions({
          queryKey: apiKeys.groups.list(userId),
          queryFn: ({ signal }) => authenticatedRequest<GroupsResponse>(apiRoutes.groups, { signal }),
          staleTime: 30_000,
        }),
      detail: (groupId: string) =>
        queryOptions({
          queryKey: apiKeys.groups.detail(groupId),
          queryFn: ({ signal }) => authenticatedRequest<GroupDetail>(`/api/groups/${groupId}`, { signal }),
          staleTime: 10_000,
        }),
      create: (userId: string) =>
        mutationOptions({
          mutationKey: ['groups', 'create', userId],
          mutationFn: (input: GroupCreate) =>
            authenticatedRequest<Group>(apiRoutes.groups, {
              method: 'POST',
              body: JSON.stringify(input),
            }),
          onSuccess: async (group) => {
            if (queryClient.getQueryData<Me | null>(apiKeys.profile)?.id !== userId) return;
            await queryClient.cancelQueries({ queryKey: apiKeys.groups.list(userId) });
            queryClient.setQueryData<GroupsResponse>(apiKeys.groups.list(userId), (current) => ({
              groups: [group, ...(current?.groups ?? []).filter((item) => item.id !== group.id)],
            }));
            await queryClient.invalidateQueries({ queryKey: apiKeys.groups.list(userId) });
          },
        }),
      addMember: (groupId: string) =>
        mutationOptions({
          mutationKey: ['groups', 'members', 'add', groupId],
          mutationFn: (input: AddMemberInput) =>
            authenticatedRequest<Member>(`/api/groups/${groupId}/members`, {
              method: 'POST',
              body: JSON.stringify(input),
            }),
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: apiKeys.groups.detail(groupId) });
          },
        }),
      joinInfo: (code: string) =>
        queryOptions({
          queryKey: apiKeys.groups.join(code),
          queryFn: ({ signal }) =>
            request<{
              group: Group;
              alreadyMember: boolean;
              myMemberId: string | null;
              members: { id: string; name: string; isClaimed: boolean }[];
            }>(`/api/groups/join/${code}`, { signal }),
        }),
      join: (code: string) =>
        mutationOptions({
          mutationKey: ['groups', 'join', code],
          mutationFn: (input: JoinGroupInput) =>
            request<{ group: Group; member: Member }>(`/api/groups/join/${code}`, {
              method: 'POST',
              body: JSON.stringify(input),
            }),
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: apiKeys.groups.all });
          },
        }),
    },
    expenses: {
      create: (groupId: string) =>
        mutationOptions({
          mutationKey: ['expenses', 'create', groupId],
          mutationFn: (input: CreateExpenseInput) =>
            authenticatedRequest<Expense>(`/api/groups/${groupId}/expenses`, {
              method: 'POST',
              body: JSON.stringify(input),
            }),
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: apiKeys.groups.detail(groupId) });
          },
        }),
      delete: (groupId: string) =>
        mutationOptions({
          mutationKey: ['expenses', 'delete', groupId],
          mutationFn: (expenseId: string) =>
            authenticatedRequest<{ success: true }>(`/api/groups/${groupId}/expenses/${expenseId}`, {
              method: 'DELETE',
            }),
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: apiKeys.groups.detail(groupId) });
          },
        }),
    },
    auth: {
      signIn: () =>
        mutationOptions({
          mutationKey: ['auth', 'sign-in'],
          mutationFn: (input: string | { email: string; turnstileToken?: string }) => {
            const email = typeof input === 'string' ? input : input.email;
            const turnstileToken = typeof input === 'string' ? undefined : input.turnstileToken;
            return request<{ status: boolean }>(apiRoutes.auth.signIn, {
              method: 'POST',
              body: JSON.stringify({
                email,
                callbackURL: `${appOrigin}/`,
                errorCallbackURL: `${appOrigin}/?authError=1`,
                ...(turnstileToken ? { turnstileToken } : {}),
              }),
            });
          },
        }),
      signOut: () =>
        mutationOptions({
          mutationKey: ['auth', 'sign-out'],
          mutationFn: () => request(apiRoutes.auth.signOut, { method: 'POST', body: '{}' }),
          onSuccess: async () => {
            await queryClient.cancelQueries();
            expireSession();
          },
        }),
    },
  };
}
