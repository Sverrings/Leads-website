// Shared with the iPhone app: Leads/src/types/database.ts. Change both together (see README).
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      follow_up_sequences: {
        Row: {
          created_at: string;
          enabled: boolean;
          id: string;
          is_default: boolean;
          name: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          is_default?: boolean;
          name: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          id?: string;
          is_default?: boolean;
          name?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follow_up_sequences_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      follow_up_steps: {
        Row: {
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          delay_minutes: number;
          id: string;
          position: number;
          sequence_id: string;
          template_id: string | null;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          delay_minutes: number;
          id?: string;
          position: number;
          sequence_id: string;
          template_id?: string | null;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          delay_minutes?: number;
          id?: string;
          position?: number;
          sequence_id?: string;
          template_id?: string | null;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follow_up_steps_sequence_id_workspace_id_fkey';
            columns: ['sequence_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'follow_up_sequences';
            referencedColumns: ['id', 'workspace_id'];
          },
          {
            foreignKeyName: 'follow_up_steps_template_id_workspace_id_fkey';
            columns: ['template_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'message_templates';
            referencedColumns: ['id', 'workspace_id'];
          },
        ];
      };
      lead_events: {
        Row: {
          actor_id: string | null;
          created_at: string;
          id: string;
          lead_id: string;
          metadata: NonNullable<Json>;
          type: Database['public']['Enums']['lead_event_type'];
          workspace_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id: string;
          metadata?: NonNullable<Json>;
          type: Database['public']['Enums']['lead_event_type'];
          workspace_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string;
          metadata?: NonNullable<Json>;
          type?: Database['public']['Enums']['lead_event_type'];
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_events_lead_id_workspace_id_fkey';
            columns: ['lead_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id', 'workspace_id'];
          },
        ];
      };
      leads: {
        Row: {
          company: string | null;
          created_at: string;
          created_by: string | null;
          email: string | null;
          follow_ups_paused: boolean;
          id: string;
          inquiry: string | null;
          last_contact_at: string | null;
          name: string;
          next_follow_up_at: string | null;
          phone: string | null;
          sequence_id: string | null;
          sequence_position: number;
          source: string | null;
          status: Database['public']['Enums']['lead_status'];
          status_changed_at: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          follow_ups_paused?: boolean;
          id?: string;
          inquiry?: string | null;
          last_contact_at?: string | null;
          name: string;
          next_follow_up_at?: string | null;
          phone?: string | null;
          sequence_id?: string | null;
          sequence_position?: number;
          source?: string | null;
          status?: Database['public']['Enums']['lead_status'];
          status_changed_at?: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          follow_ups_paused?: boolean;
          id?: string;
          inquiry?: string | null;
          last_contact_at?: string | null;
          name?: string;
          next_follow_up_at?: string | null;
          phone?: string | null;
          sequence_id?: string | null;
          sequence_position?: number;
          source?: string | null;
          status?: Database['public']['Enums']['lead_status'];
          status_changed_at?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_sequence_id_workspace_id_fkey';
            columns: ['sequence_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'follow_up_sequences';
            referencedColumns: ['id', 'workspace_id'];
          },
          {
            foreignKeyName: 'leads_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      message_templates: {
        Row: {
          body: string;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          id: string;
          name: string;
          subject: string;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          body: string;
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          id?: string;
          name: string;
          subject?: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          body?: string;
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          id?: string;
          name?: string;
          subject?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_templates_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          ai_generated: boolean;
          automated: boolean;
          body: string;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          direction: Database['public']['Enums']['message_direction'];
          error: string | null;
          id: string;
          lead_id: string;
          provider: string;
          provider_message_id: string | null;
          sent_at: string | null;
          sent_by: string | null;
          status: Database['public']['Enums']['message_status'];
          subject: string | null;
          to_address: string | null;
          workspace_id: string;
        };
        Insert: {
          ai_generated?: boolean;
          automated?: boolean;
          body: string;
          channel: Database['public']['Enums']['message_channel'];
          created_at?: string;
          direction?: Database['public']['Enums']['message_direction'];
          error?: string | null;
          id?: string;
          lead_id: string;
          provider: string;
          provider_message_id?: string | null;
          sent_at?: string | null;
          sent_by?: string | null;
          status: Database['public']['Enums']['message_status'];
          subject?: string | null;
          to_address?: string | null;
          workspace_id: string;
        };
        Update: {
          ai_generated?: boolean;
          automated?: boolean;
          body?: string;
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          direction?: Database['public']['Enums']['message_direction'];
          error?: string | null;
          id?: string;
          lead_id?: string;
          provider?: string;
          provider_message_id?: string | null;
          sent_at?: string | null;
          sent_by?: string | null;
          status?: Database['public']['Enums']['message_status'];
          subject?: string | null;
          to_address?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_lead_id_workspace_id_fkey';
            columns: ['lead_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id', 'workspace_id'];
          },
          {
            foreignKeyName: 'messages_sent_by_fkey';
            columns: ['sent_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          lead_id: string | null;
          link: string | null;
          pushed_at: string | null;
          read_at: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          link?: string | null;
          pushed_at?: string | null;
          read_at?: string | null;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
          workspace_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          link?: string | null;
          pushed_at?: string | null;
          read_at?: string | null;
          title?: string;
          type?: Database['public']['Enums']['notification_type'];
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          platform: string;
          registered_at: string;
          token: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          platform: string;
          registered_at?: string;
          token: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          platform?: string;
          registered_at?: string;
          token?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      scheduled_follow_ups: {
        Row: {
          attempts: number;
          cancel_reason: string | null;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          created_by: string | null;
          draft_body: string | null;
          draft_subject: string | null;
          id: string;
          last_error: string | null;
          lead_id: string;
          locked_at: string | null;
          message_id: string | null;
          next_attempt_at: string | null;
          ready_reason: string | null;
          scheduled_for: string;
          sent_at: string | null;
          sequence_id: string | null;
          status: Database['public']['Enums']['follow_up_status'];
          step_id: string | null;
          step_position: number | null;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          attempts?: number;
          cancel_reason?: string | null;
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          created_by?: string | null;
          draft_body?: string | null;
          draft_subject?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id: string;
          locked_at?: string | null;
          message_id?: string | null;
          next_attempt_at?: string | null;
          ready_reason?: string | null;
          scheduled_for: string;
          sent_at?: string | null;
          sequence_id?: string | null;
          status?: Database['public']['Enums']['follow_up_status'];
          step_id?: string | null;
          step_position?: number | null;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          attempts?: number;
          cancel_reason?: string | null;
          channel?: Database['public']['Enums']['message_channel'];
          created_at?: string;
          created_by?: string | null;
          draft_body?: string | null;
          draft_subject?: string | null;
          id?: string;
          last_error?: string | null;
          lead_id?: string;
          locked_at?: string | null;
          message_id?: string | null;
          next_attempt_at?: string | null;
          ready_reason?: string | null;
          scheduled_for?: string;
          sent_at?: string | null;
          sequence_id?: string | null;
          status?: Database['public']['Enums']['follow_up_status'];
          step_id?: string | null;
          step_position?: number | null;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scheduled_follow_ups_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_follow_ups_lead_id_workspace_id_fkey';
            columns: ['lead_id', 'workspace_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id', 'workspace_id'];
          },
          {
            foreignKeyName: 'scheduled_follow_ups_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_follow_ups_sequence_id_fkey';
            columns: ['sequence_id'];
            isOneToOne: false;
            referencedRelation: 'follow_up_sequences';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scheduled_follow_ups_step_id_fkey';
            columns: ['step_id'];
            isOneToOne: false;
            referencedRelation: 'follow_up_steps';
            referencedColumns: ['id'];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string;
          id: string;
          notification_preferences: NonNullable<Json>;
          role: Database['public']['Enums']['workspace_role'];
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notification_preferences?: NonNullable<Json>;
          role?: Database['public']['Enums']['workspace_role'];
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notification_preferences?: NonNullable<Json>;
          role?: Database['public']['Enums']['workspace_role'];
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspace_settings: {
        Row: {
          ai_drafts_enabled: boolean;
          auto_send_enabled: boolean;
          default_tone: string;
          email_signature: string | null;
          reply_to_email: string | null;
          sender_name: string | null;
          updated_at: string;
          workspace_id: string;
        };
        Insert: {
          ai_drafts_enabled?: boolean;
          auto_send_enabled?: boolean;
          default_tone?: string;
          email_signature?: string | null;
          reply_to_email?: string | null;
          sender_name?: string | null;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          ai_drafts_enabled?: boolean;
          auto_send_enabled?: boolean;
          default_tone?: string;
          email_signature?: string | null;
          reply_to_email?: string | null;
          sender_name?: string | null;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_settings_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: true;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspace_subscriptions: {
        Row: {
          checked_at: string;
          environment: string;
          expires_at: string | null;
          original_transaction_id: string;
          product_id: string;
          purchased_by: string | null;
          status: string;
          trial_reminder_sent_at: string | null;
          updated_at: string;
          will_renew: boolean;
          workspace_id: string;
        };
        Insert: {
          checked_at?: string;
          environment?: string;
          expires_at?: string | null;
          original_transaction_id: string;
          product_id: string;
          purchased_by?: string | null;
          status: string;
          trial_reminder_sent_at?: string | null;
          updated_at?: string;
          will_renew?: boolean;
          workspace_id: string;
        };
        Update: {
          checked_at?: string;
          environment?: string;
          expires_at?: string | null;
          original_transaction_id?: string;
          product_id?: string;
          purchased_by?: string | null;
          status?: string;
          trial_reminder_sent_at?: string | null;
          updated_at?: string;
          will_renew?: boolean;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_subscriptions_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: true;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          invite_code: string;
          name: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invite_code?: string;
          name: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invite_code?: string;
          name?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspaces_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_lead_note: { Args: { p_body: string; p_lead_id: string }; Returns: undefined };
      apply_subscription: {
        Args: {
          p_environment: string;
          p_expires_at: string;
          p_original_transaction_id: string;
          p_product_id: string;
          p_purchased_by?: string;
          p_status: string;
          p_will_renew: boolean;
          p_workspace_id: string;
        };
        Returns: undefined;
      };
      billing_status: { Args: { p_workspace_id: string }; Returns: Json };
      cancel_follow_up: { Args: { p_follow_up_id: string; p_reason: string }; Returns: undefined };
      claim_due_follow_ups: {
        Args: { p_limit?: number };
        Returns: {
          attempts: number;
          cancel_reason: string | null;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          created_by: string | null;
          draft_body: string | null;
          draft_subject: string | null;
          id: string;
          last_error: string | null;
          lead_id: string;
          locked_at: string | null;
          message_id: string | null;
          next_attempt_at: string | null;
          ready_reason: string | null;
          scheduled_for: string;
          sent_at: string | null;
          sequence_id: string | null;
          status: Database['public']['Enums']['follow_up_status'];
          step_id: string | null;
          step_position: number | null;
          updated_at: string;
          workspace_id: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'scheduled_follow_ups';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      claim_push_notifications: {
        Args: { p_limit?: number };
        Returns: {
          body: string;
          lead_id: string;
          link: string;
          notification_id: string;
          title: string;
          tokens: string[];
          type: Database['public']['Enums']['notification_type'];
        }[];
      };
      claim_subscription_checks: {
        Args: { p_limit?: number };
        Returns: {
          environment: string;
          original_transaction_id: string;
          workspace_id: string;
        }[];
      };
      create_workspace: {
        Args: { p_name: string; p_timezone?: string };
        Returns: {
          created_at: string;
          created_by: string | null;
          id: string;
          invite_code: string;
          name: string;
          timezone: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'workspaces';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      delete_account_data: { Args: { p_user_id: string }; Returns: Json };
      forget_push_tokens: { Args: { p_tokens: string[] }; Returns: undefined };
      join_workspace: {
        Args: { p_invite_code: string };
        Returns: {
          created_at: string;
          created_by: string | null;
          id: string;
          invite_code: string;
          name: string;
          timezone: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'workspaces';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      log_contact: {
        Args: { p_channel: string; p_lead_id: string; p_note?: string };
        Returns: undefined;
      };
      mark_follow_up_ready: {
        Args: {
          p_draft_body?: string;
          p_draft_subject?: string;
          p_error?: string;
          p_follow_up_id: string;
          p_reason: string;
        };
        Returns: undefined;
      };
      record_outbound_message: {
        Args: {
          p_ai_generated?: boolean;
          p_automated?: boolean;
          p_body: string;
          p_channel: Database['public']['Enums']['message_channel'];
          p_follow_up_id?: string;
          p_lead_id: string;
          p_provider: string;
          p_provider_message_id?: string;
          p_sent_by?: string;
          p_subject: string;
          p_to_address: string;
        };
        Returns: string;
      };
      regenerate_invite_code: { Args: { p_workspace_id: string }; Returns: string };
      register_push_token: {
        Args: { p_platform: string; p_token: string };
        Returns: undefined;
      };
      retry_follow_up_later: {
        Args: { p_error: string; p_follow_up_id: string; p_retry_at: string };
        Returns: undefined;
      };
      schedule_follow_up: {
        Args: { p_lead_id: string; p_scheduled_for: string };
        Returns: {
          attempts: number;
          cancel_reason: string | null;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          created_by: string | null;
          draft_body: string | null;
          draft_subject: string | null;
          id: string;
          last_error: string | null;
          lead_id: string;
          locked_at: string | null;
          message_id: string | null;
          next_attempt_at: string | null;
          ready_reason: string | null;
          scheduled_for: string;
          sent_at: string | null;
          sequence_id: string | null;
          status: Database['public']['Enums']['follow_up_status'];
          step_id: string | null;
          step_position: number | null;
          updated_at: string;
          workspace_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'scheduled_follow_ups';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      set_follow_ups_paused: {
        Args: { p_lead_id: string; p_paused: boolean };
        Returns: {
          company: string | null;
          created_at: string;
          created_by: string | null;
          email: string | null;
          follow_ups_paused: boolean;
          id: string;
          inquiry: string | null;
          last_contact_at: string | null;
          name: string;
          next_follow_up_at: string | null;
          phone: string | null;
          sequence_id: string | null;
          sequence_position: number;
          source: string | null;
          status: Database['public']['Enums']['lead_status'];
          status_changed_at: string;
          updated_at: string;
          workspace_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'leads';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      skip_follow_up: {
        Args: { p_lead_id: string };
        Returns: {
          attempts: number;
          cancel_reason: string | null;
          channel: Database['public']['Enums']['message_channel'];
          created_at: string;
          created_by: string | null;
          draft_body: string | null;
          draft_subject: string | null;
          id: string;
          last_error: string | null;
          lead_id: string;
          locked_at: string | null;
          message_id: string | null;
          next_attempt_at: string | null;
          ready_reason: string | null;
          scheduled_for: string;
          sent_at: string | null;
          sequence_id: string | null;
          status: Database['public']['Enums']['follow_up_status'];
          step_id: string | null;
          step_position: number | null;
          updated_at: string;
          workspace_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'scheduled_follow_ups';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      unregister_push_token: { Args: { p_token: string }; Returns: undefined };
      verify_cron_secret: { Args: { p_secret: string }; Returns: boolean };
    };
    Enums: {
      follow_up_status: 'pending' | 'processing' | 'ready' | 'sent' | 'skipped' | 'cancelled';
      lead_event_type:
        | 'lead_created'
        | 'lead_updated'
        | 'status_changed'
        | 'note_added'
        | 'contact_logged'
        | 'follow_up_scheduled'
        | 'follow_up_ready'
        | 'follow_up_sent'
        | 'follow_up_failed'
        | 'follow_up_skipped'
        | 'follow_up_cancelled'
        | 'follow_ups_paused'
        | 'follow_ups_resumed'
        | 'sequence_completed'
        | 'message_received';
      lead_status: 'new' | 'waiting' | 'replied' | 'converted' | 'closed';
      message_channel: 'email' | 'sms' | 'whatsapp';
      message_direction: 'outbound' | 'inbound';
      message_status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received';
      notification_type:
        'follow_up_ready' | 'follow_up_failed' | 'follow_up_sent' | 'lead_replied' | 'system';
      workspace_role: 'owner' | 'admin' | 'member';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      follow_up_status: ['pending', 'processing', 'ready', 'sent', 'skipped', 'cancelled'],
      lead_event_type: [
        'lead_created',
        'lead_updated',
        'status_changed',
        'note_added',
        'contact_logged',
        'follow_up_scheduled',
        'follow_up_ready',
        'follow_up_sent',
        'follow_up_failed',
        'follow_up_skipped',
        'follow_up_cancelled',
        'follow_ups_paused',
        'follow_ups_resumed',
        'sequence_completed',
        'message_received',
      ],
      lead_status: ['new', 'waiting', 'replied', 'converted', 'closed'],
      message_channel: ['email', 'sms', 'whatsapp'],
      message_direction: ['outbound', 'inbound'],
      message_status: ['queued', 'sent', 'delivered', 'failed', 'received'],
      notification_type: [
        'follow_up_ready',
        'follow_up_failed',
        'follow_up_sent',
        'lead_replied',
        'system',
      ],
      workspace_role: ['owner', 'admin', 'member'],
    },
  },
} as const;
