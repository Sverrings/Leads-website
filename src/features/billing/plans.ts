// Shared with the iPhone app: Leads/src/features/billing/plans.ts (with the web's Supabase client). Change both together.
import { z } from 'zod';

/**
 * Leads Pro. One subscription group ("Leads Pro") with a monthly and a yearly
 * plan, both with a free trial set up as an introductory offer in App Store
 * Connect. Apple runs the trial, the charging and the cancelling; the server
 * records what Apple says. Keep the ids in sync with App Store Connect and
 * APPSTORE_PRODUCT_IDS on the server.
 */
export const PRODUCT_IDS = {
  monthly: 'com.sverrings.leads.pro.monthly',
  yearly: 'com.sverrings.leads.pro.yearly',
} as const;

export type PlanId = keyof typeof PRODUCT_IDS;

export const ALL_PRODUCT_IDS: string[] = Object.values(PRODUCT_IDS);

export function planIdForProduct(productId: string | null | undefined): PlanId | null {
  if (productId === PRODUCT_IDS.monthly) return 'monthly';
  if (productId === PRODUCT_IDS.yearly) return 'yearly';
  return null;
}

/** Days before the trial ends that Leads reminds people (send_trial_reminders). */
export const TRIAL_REMINDER_DAYS = 2;

/** What billing_status() returns. */
export const billingStatusSchema = z.object({
  /** False until the App Store side is live: no limits, no offers. */
  enabled: z.boolean(),
  pro: z.boolean(),
  status: z.enum(['none', 'active', 'trial', 'grace', 'billing_retry', 'expired', 'revoked']),
  product_id: z.string().nullable(),
  expires_at: z.string().nullable(),
  will_renew: z.boolean(),
  purchased_by_me: z.boolean(),
  active_leads: z.number().int(),
  free_active_leads: z.number().int(),
  can_manage: z.boolean(),
});

export type BillingStatus = z.infer<typeof billingStatusSchema>;

/** Statuses that are not ordinary (in trial, retrying a payment, in grace). */
export type PlanStatus = BillingStatus['status'];

/** The database refused a lead because the free plan is full (leads_enforce_plan). */
export function isLeadLimitError(error: unknown): boolean {
  const cause = (error as { cause?: { hint?: unknown } } | null)?.cause;
  const hint = cause?.hint ?? (error as { hint?: unknown } | null)?.hint;
  return hint === 'free_lead_limit';
}
