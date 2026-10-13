// Shared with the iPhone app: Leads/src/lib/query-keys.ts. Change both together.
/**
 * Every React Query key in one place. Keys are scoped by workspace so switching
 * workspaces can never show another workspace's cached data.
 */
export const queryKeys = {
  memberships: (userId: string) => ['memberships', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,

  workspace: (workspaceId: string) => ['workspace', workspaceId] as const,
  workspaceSettings: (workspaceId: string) => ['workspace', workspaceId, 'settings'] as const,
  workspaceMembers: (workspaceId: string) => ['workspace', workspaceId, 'members'] as const,
  notificationPreferences: (workspaceId: string, userId: string) =>
    ['workspace', workspaceId, 'notification-preferences', userId] as const,

  leads: (workspaceId: string) => ['workspace', workspaceId, 'leads'] as const,
  lead: (workspaceId: string, leadId: string) =>
    ['workspace', workspaceId, 'lead', leadId] as const,
  leadTimeline: (workspaceId: string, leadId: string) =>
    ['workspace', workspaceId, 'lead', leadId, 'timeline'] as const,

  activity: (workspaceId: string) => ['workspace', workspaceId, 'activity'] as const,
  notifications: (workspaceId: string) => ['workspace', workspaceId, 'notifications'] as const,
  billing: (workspaceId: string) => ['workspace', workspaceId, 'billing'] as const,

  /** Prices and trial eligibility from the App Store (per Apple ID, not per workspace). */
  storeOffer: () => ['store-offer'] as const,
  pushStatus: (userId: string) => ['push-status', userId] as const,

  templates: (workspaceId: string) => ['workspace', workspaceId, 'templates'] as const,
  sequence: (workspaceId: string) => ['workspace', workspaceId, 'sequence'] as const,
};
