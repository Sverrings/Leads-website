'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { useNow } from '@/lib/useNow';
import { Button, ButtonLink } from '@/ui/Button';
import { Card } from '@/ui/Display';
import { useConfirm } from '@/ui/Dialog';
import { useToast } from '@/ui/Toast';

import { usePlan } from '../billing/hooks';
import { isLeadLimitError } from '../billing/plans';
import { FollowUpTimePicker } from '../follow-ups/FollowUpTimePicker';
import { PageHeader } from '../panel/Page';
import { useScheduleDescription } from '../sequences/hooks';
import { LeadFields, useLeadForm } from './components/LeadForm';
import styles from './components/form.module.css';
import { useCreateLead } from './hooks';
import { EMPTY_LEAD_FORM, toLeadInput } from './schemas';

/** Someone who called, emailed or messaged about a job. Their name is enough to start. */
export function NewLeadView() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const now = useNow();
  const plan = usePlan();
  const schedule = useScheduleDescription();
  const createLead = useCreateLead();
  const form = useLeadForm(EMPTY_LEAD_FORM);
  const [firstFollowUp, setFirstFollowUp] = useState<Date | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const followUpsApply = form.values.status === 'new' || form.values.status === 'waiting';

  const save = (event: FormEvent) => {
    event.preventDefault();
    const data = form.validate();
    if (!data) return;
    createLead.mutate(
      {
        ...toLeadInput(data),
        next_follow_up_at: followUpsApply && firstFollowUp ? firstFollowUp.toISOString() : null,
      },
      {
        onSuccess: (lead) => {
          toast.success(`${lead.name} added`, lead.email ? 'Leads will tell you when to follow up.' : undefined);
          router.push(`/app/leads/${lead.id}`);
        },
        onError: (error) => {
          // The database enforces the free plan's limit, even if this page didn't know yet.
          if (isLeadLimitError(error)) setLimitHit(true);
          else toast.error(error, 'Unable to save lead');
        },
      },
    );
  };

  const cancel = async () => {
    if (form.dirty || firstFollowUp) {
      const discard = await confirm({
        title: 'Discard this lead?',
        message: 'What you typed will not be saved.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
        destructive: true,
      });
      if (!discard) return;
    }
    router.push('/app/leads');
  };

  if (plan.atLimit || limitHit) {
    return (
      <>
        <PageHeader title="New lead" back={{ href: '/app/leads', label: 'Leads' }} />
        <Card>
          <div className={styles.limit}>
            <h2>You have {plan.activeLeads} active leads</h2>
            <p>
              The free plan includes {plan.freeLimit}. To add another, mark leads Won or Lost until fewer than{' '}
              {plan.freeLimit} are active. Nothing you added is lost.
            </p>
            <p>
              Leads Pro removes the limit for everyone in your workspace. You start it in the Leads app on
              iPhone, under Settings → Leads Pro, and it works here straight away.
            </p>
            <div className={styles.footer} style={{ justifyContent: 'flex-start' }}>
              <ButtonLink href="/app/leads?stage=waiting" variant="primary">
                Review active leads
              </ButtonLink>
              <ButtonLink href="/app/settings/plan" variant="ghost">
                About Leads Pro
              </ButtonLink>
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        title="New lead"
        subtitle="Someone who called, emailed or messaged about a job."
        back={{ href: '/app/leads', label: 'Leads' }}
        actions={
          <>
            <Button variant="ghost" onClick={() => void cancel()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createLead.isPending}>
              Save lead
            </Button>
          </>
        }
      />
      <div style={{ display: 'grid', gap: 20, maxWidth: 820 }}>
        <Card title="Details">
          <LeadFields form={form} autoFocus />
        </Card>
        {followUpsApply ? (
          <Card title="First follow-up" subtitle="When Leads should remind you first.">
            <FollowUpTimePicker
              value={firstFollowUp}
              onChange={setFirstFollowUp}
              now={now}
              automatic={{ label: 'Automatic', description: schedule ?? 'Follows your follow-up rules' }}
            />
          </Card>
        ) : null}
        <div className={styles.footer}>
          <Button variant="ghost" onClick={() => void cancel()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={createLead.isPending}>
            Save lead
          </Button>
        </div>
      </div>
    </form>
  );
}
