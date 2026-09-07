export const apiRoutes = {
  auth: {
    signIn: '/api/auth/sign-in/magic-link',
    signOut: '/api/auth/sign-out',
  },
  me: '/api/me',
  profile: '/api/me',
  groups: '/api/groups',
  group: (id: string) => `/api/groups/${id}` as const,
  groupMembers: (id: string) => `/api/groups/${id}/members` as const,
  groupJoin: (code: string) => `/api/groups/join/${code}` as const,
  groupExpenses: (id: string) => `/api/groups/${id}/expenses` as const,
  groupExpense: (groupId: string, expenseId: string) => `/api/groups/${groupId}/expenses/${expenseId}` as const,
} as const;
