'use client';

import { formatShortDate } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { ErrorState, SkeletonRows } from '@/ui/Display';
import { Icon } from '@/ui/Icon';

import { useBillingStatus, usePlan, type Plan } from '../../billing/hooks';
import { useCurrentWorkspace } from '../../workspace/WorkspaceProvider';
import { SettingsRow, SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

function planName(plan: Plan): string {
  if (!plan.pro) return 'Free';
  if (plan.planId === 'yearly') return 'Leads Pro, yearly';
  if (plan.planId === 'monthly') return 'Leads Pro, monthly';
  return 'Leads Pro';
}

/**
 * The plan, read-only. Leads Pro is an App Store subscription, so it is
 * started, changed and cancelled in the iPhone app; the web app follows it.
 */
export function PlanPage() {
  const now = useNow();
  const { workspace } = useCurrentWorkspace();
  const status = useBillingStatus();
  const plan = usePlan();

  if (status.isError) {
    return <ErrorState title="Unable to load your plan" error={status.error} onRetry={() => void status.refetch()} />;
  }
  if (!plan.loaded) return <SkeletonRows rows={3} />;

  const date = plan.expiresAt ? formatShortDate(plan.expiresAt, now) : null;
  const statusLine = (() => {
    if (!plan.enabled) return "Leads Pro isn't available yet. Until it is, there's no limit on leads.";
    switch (plan.status) {
      case 'trial':
        return plan.willRenew ? `Free trial until ${date}, then it renews.` : `Free trial until ${date}. It won't renew.`;
      case 'active':
        return plan.willRenew ? `Renews ${date}.` : `Ends ${date}. It won't renew.`;
      case 'grace':
      case 'billing_retry':
        return "Apple couldn't charge the Apple ID that pays for Leads Pro. Updating the payment method keeps Pro going.";
      case 'expired':
      case 'revoked':
        return `Leads Pro ended${date ? ` ${date}` : ''}. Every lead is still here.`;
      default:
        return `The free plan covers ${plan.freeLimit} active leads at a time. Won and Lost leads never count.`;
    }
  })();

  return (
    <>
      <SettingsSection title="Leads Pro" description={statusLine}>
        <SettingsRow title="Plan" control={<span>{plan.enabled ? planName(plan) : 'Free'}</span>} />
        {!plan.pro ? (
          <SettingsRow title="Active leads" control={<span>{`${plan.activeLeads} of ${plan.freeLimit}`}</span>} />
        ) : null}
        <SettingsRow title="Covers" control={<span>Everyone in {workspace.name}</span>} />
      </SettingsSection>

      <SettingsSection title="Starting or changing Pro">
        <div className={styles.notice}>
          <Icon name="smartphone" size={15} />
          <span>
            Leads Pro is bought through the App Store: open the Leads app on iPhone and go to Settings → Leads Pro.
            Monthly or yearly, with 14 days free to try. It covers this web app straight away, and you cancel it in the
            same place.
          </span>
        </div>
        <p className={styles.muted}>
          When Pro ends, nothing is deleted. Every lead stays, with its history and follow-ups. While more than{' '}
          {plan.freeLimit} leads are active, adding another needs Pro.
        </p>
      </SettingsSection>
    </>
  );
}
