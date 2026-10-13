// Shared with the iPhone app: Leads/src/types/models.ts. Change both together (see README).
import type { Enums, Tables } from './database.types';

/**
 * Domain aliases over the generated database types. Feature code imports from
 * here so a regenerated `database.ts` never ripples through the app.
 */
export type Profile = Tables<'profiles'>;
export type Workspace = Tables<'workspaces'>;
export type WorkspaceMember = Tables<'workspace_members'>;
export type WorkspaceRole = Enums<'workspace_role'>;
export type WorkspaceSettings = Tables<'workspace_settings'>;

export type Lead = Tables<'leads'>;
export type LeadStatus = Enums<'lead_status'>;
export type LeadEvent = Tables<'lead_events'>;
export type LeadEventType = Enums<'lead_event_type'>;

export type Message = Tables<'messages'>;
export type MessageChannel = Enums<'message_channel'>;

export type MessageTemplate = Tables<'message_templates'>;
export type FollowUpSequence = Tables<'follow_up_sequences'>;
export type FollowUpStep = Tables<'follow_up_steps'>;
export type ScheduledFollowUp = Tables<'scheduled_follow_ups'>;
export type FollowUpStatus = Enums<'follow_up_status'>;

export type Notification = Tables<'notifications'>;
export type NotificationType = Enums<'notification_type'>;

export type ReadyReason = 'approval_required' | 'missing_contact' | 'send_failed' | 'reminder';

/** The open (pending / processing / ready) follow-up for a lead, if any. */
export type OpenFollowUp = Pick<
  ScheduledFollowUp,
  | 'id'
  | 'status'
  | 'step_id'
  | 'step_position'
  | 'scheduled_for'
  | 'ready_reason'
  | 'draft_subject'
  | 'draft_body'
  | 'last_error'
>;

export type LeadWithFollowUp = Lead & { followUp: OpenFollowUp | null };

export type MembershipWithWorkspace = Pick<WorkspaceMember, 'role' | 'workspace_id'> & {
  workspace: Workspace;
};
