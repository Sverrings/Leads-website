// Shared with the iPhone app: Leads/src/features/workspace/api.ts (with the web's Supabase client). Change both together.
import { assertOk, toAppError, unwrap } from '@/lib/errors';
import { db } from '@/lib/db';
import type {
  MembershipWithWorkspace,
  NotificationType,
  Profile,
  Workspace,
  WorkspaceRole,
  WorkspaceSettings,
} from '@/lib/models';

export type WorkspaceMemberWithProfile = {
  id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile: Pick<Profile, 'display_name' | 'avatar_url'> | null;
};

export type WorkspaceSettingsPatch = Partial<
  Pick<
    WorkspaceSettings,
    | 'auto_send_enabled'
    | 'ai_drafts_enabled'
    | 'default_tone'
    | 'sender_name'
    | 'reply_to_email'
    | 'email_signature'
  >
>;

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export async function fetchMemberships(userId: string): Promise<MembershipWithWorkspace[]> {
  const result = await db()
    .from('workspace_members')
    .select('role, workspace_id, workspace:workspaces(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  return unwrap(result, { title: 'Unable to load your workspaces' });
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const result = await db().rpc('create_workspace', {
    p_name: name,
    p_timezone: deviceTimeZone(),
  });
  return unwrap(result, {
    title: 'Unable to create workspace',
    description: 'Your workspace was not created. Try again.',
  });
}

export async function joinWorkspace(inviteCode: string): Promise<Workspace> {
  const result = await db().rpc('join_workspace', { p_invite_code: inviteCode });
  return unwrap(result, { title: 'Unable to join workspace' });
}

export async function updateWorkspace(
  workspaceId: string,
  patch: { name: string },
): Promise<Workspace> {
  const result = await db()
    .from('workspaces')
    .update(patch)
    .eq('id', workspaceId)
    .select('*')
    .single();
  return unwrap(result, {
    title: 'Unable to save workspace',
    description: 'Your changes were not saved.',
  });
}

export async function regenerateInviteCode(workspaceId: string): Promise<string> {
  const result = await db().rpc('regenerate_invite_code', { p_workspace_id: workspaceId });
  return unwrap(result, { title: 'Unable to create a new invite code' });
}

export async function fetchWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
  const result = await db()
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();
  return unwrap(result, { title: 'Unable to load settings' });
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  patch: WorkspaceSettingsPatch,
): Promise<WorkspaceSettings> {
  const { data, error } = await db()
    .from('workspace_settings')
    .update(patch)
    .eq('workspace_id', workspaceId)
    .select('*')
    .maybeSingle();
  if (error)
    throw toAppError(error, {
      title: 'Unable to save settings',
      description: 'Your changes were not saved.',
    });
  if (!data) {
    // RLS filtered the update: only owners and admins may change workspace settings.
    throw toAppError({ code: '42501' }, { title: 'Unable to save settings' });
  }
  return data;
}

export async function fetchWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMemberWithProfile[]> {
  const result = await db()
    .from('workspace_members')
    .select('id, user_id, role, created_at, profile:profiles(display_name, avatar_url)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });
  return unwrap(result, { title: 'Unable to load members' });
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const result = await db().from('profiles').select('*').eq('id', userId).single();
  return unwrap(result, { title: 'Unable to load your profile' });
}

export async function updateProfile(
  userId: string,
  patch: { display_name: string },
): Promise<Profile> {
  const result = await db()
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();
  return unwrap(result, {
    title: 'Unable to save profile',
    description: 'Your changes were not saved.',
  });
}

export type NotificationPreferences = Partial<Record<NotificationType, boolean>>;

export async function fetchNotificationPreferences(
  workspaceId: string,
  userId: string,
): Promise<NotificationPreferences> {
  const result = await db()
    .from('workspace_members')
    .select('notification_preferences')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single();
  const row = unwrap(result, { title: 'Unable to load notification settings' });
  return (row.notification_preferences ?? {}) as NotificationPreferences;
}

export async function updateNotificationPreferences(
  workspaceId: string,
  userId: string,
  preferences: NotificationPreferences,
): Promise<void> {
  const result = await db()
    .from('workspace_members')
    .update({ notification_preferences: preferences })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  assertOk(result, { title: 'Unable to save notification settings' });
}
