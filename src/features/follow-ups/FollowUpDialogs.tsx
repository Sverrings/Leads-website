'use client';

import { useState } from 'react';

import type { LeadWithFollowUp } from '@/lib/models';
import { useNow } from '@/lib/useNow';
import { Button } from '@/ui/Button';
import { Dialog, DialogBody, DialogFooter } from '@/ui/Dialog';
import { TextArea } from '@/ui/Field';
import { Icon, type IconName } from '@/ui/Icon';
import { useToast } from '@/ui/Toast';

import styles from '../leads/components/form.module.css';
import type { ContactChannel } from './api';
import { FollowUpTimePicker } from './FollowUpTimePicker';
import { useLogContact, useScheduleFollowUp, useSkipFollowUp } from './hooks';

const CHANNELS: { value: ContactChannel; label: string; icon: IconName }[] = [
  { value: 'call', label: 'Phone call', icon: 'phone' },
  { value: 'meeting', label: 'Meeting', icon: 'users' },
  { value: 'email', label: 'Email from another inbox', icon: 'mail' },
  { value: 'sms', label: 'Text message', icon: 'message-circle' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' },
];

type DialogProps = { lead: LeadWithFollowUp; open: boolean; onClose: () => void };

/** "I reached them another way": counts as contact, and the next follow-up moves on. */
export function LogContactDialog({ lead, open, onClose }: DialogProps) {
  return (
    <Dialog open={open} onClose={onClose} custom title="Log contact" description={`How did you reach ${lead.name}?`}>
      <LogContactForm lead={lead} onClose={onClose} />
    </Dialog>
  );
}

function LogContactForm({ lead, onClose }: { lead: LeadWithFollowUp; onClose: () => void }) {
  const toast = useToast();
  const logContact = useLogContact(lead.id);
  const [channel, setChannel] = useState<ContactChannel>('call');
  const [note, setNote] = useState('');

  const save = () =>
    logContact.mutate(
      { channel, note },
      {
        onSuccess: (updated) => {
          toast.success('Contact logged', updated?.followUp ? 'The next follow-up is scheduled.' : undefined);
          onClose();
        },
        onError: (error) => toast.error(error, 'Unable to log contact'),
      },
    );

  return (
    <>
      <DialogBody>
        <div className={styles.choices} role="radiogroup" aria-label="Channel">
          {CHANNELS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={channel === option.value}
              className={styles.choice}
              onClick={() => setChannel(option.value)}>
              <span className={styles.choiceLabel} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name={option.icon} size={14} />
                {option.label}
              </span>
            </button>
          ))}
        </div>
        <TextArea
          label="What happened"
          optional
          rows={3}
          placeholder="Called, she wants a visit next week"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
        />
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" loading={logContact.isPending} onClick={save}>
          Log contact
        </Button>
      </DialogFooter>
    </>
  );
}

/** Move the next follow-up, or skip it. */
export function ScheduleDialog({ lead, open, onClose }: DialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      custom
      title="When should you follow up?"
      description={`Leads reminds you about ${lead.name} at this time.`}>
      <ScheduleForm lead={lead} onClose={onClose} />
    </Dialog>
  );
}

function ScheduleForm({ lead, onClose }: { lead: LeadWithFollowUp; onClose: () => void }) {
  const toast = useToast();
  const now = useNow();
  const schedule = useScheduleFollowUp(lead.id);
  const skip = useSkipFollowUp(lead.id);
  const [at, setAt] = useState<Date | null>(null);
  const pending = lead.followUp && lead.followUp.status !== 'processing';

  const save = () => {
    if (!at) return;
    schedule.mutate(at, {
      onSuccess: () => {
        toast.success('Follow-up scheduled');
        onClose();
      },
      onError: (error) => toast.error(error, 'Unable to schedule follow-up'),
    });
  };

  const skipNext = () =>
    skip.mutate(undefined, {
      onSuccess: () => {
        toast.success('Follow-up skipped');
        onClose();
      },
      onError: (error) => toast.error(error, 'Unable to skip follow-up'),
    });

  return (
    <>
      <DialogBody>
        <FollowUpTimePicker value={at} onChange={setAt} now={now} />
      </DialogBody>
      <DialogFooter>
        {pending ? (
          <Button variant="ghost" onClick={skipNext} loading={skip.isPending} style={{ marginRight: 'auto' }}>
            Skip this follow-up
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" loading={schedule.isPending} onClick={save} disabled={!at}>
          Schedule
        </Button>
      </DialogFooter>
    </>
  );
}
