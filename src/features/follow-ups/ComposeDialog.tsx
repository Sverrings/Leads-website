'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { LeadWithFollowUp } from '@/lib/models';
import { getFirstName } from '@/lib/strings';
import { Button } from '@/ui/Button';
import { Dialog, DialogBody, DialogFooter, useConfirm } from '@/ui/Dialog';
import { Skeleton } from '@/ui/Display';
import { TextArea, TextField } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import styles from '../leads/components/detail.module.css';
import { useDraftFollowUp, useLogContact } from './hooks';

type CloseCheck = (() => Promise<boolean>) | null;

/**
 * Draft → edit → send from your own email. Drafts come from the next step's
 * template (the same server function the app uses). Until Leads sends email
 * itself, the message opens in the person's email app; afterwards they
 * confirm it went out, and the next follow-up is scheduled.
 */
export function ComposeDialog({
  lead,
  open,
  onClose,
}: {
  lead: LeadWithFollowUp;
  open: boolean;
  onClose: () => void;
}) {
  // The content decides whether closing would throw away an edited message.
  const closeCheck = useRef<CloseCheck>(null);
  const registerCloseCheck = useCallback((check: CloseCheck) => {
    closeCheck.current = check;
  }, []);
  const requestClose = async () => {
    if (closeCheck.current && !(await closeCheck.current())) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => void requestClose()}
      wide
      custom
      title={lead.status === 'replied' ? `Reply to ${getFirstName(lead.name)}` : `Follow up with ${getFirstName(lead.name)}`}
      description={lead.email ? `To ${lead.email}` : undefined}>
      <Composer lead={lead} registerCloseCheck={registerCloseCheck} onDone={onClose} />
    </Dialog>
  );
}

/** Mounted each time the dialog opens, so it always starts from the current draft. */
function Composer({
  lead,
  registerCloseCheck,
  onDone,
}: {
  lead: LeadWithFollowUp;
  registerCloseCheck: (check: CloseCheck) => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const confirm = useConfirm();
  const draft = useDraftFollowUp(lead.id);
  const logContact = useLogContact(lead.id);

  const prepared = lead.followUp?.status === 'ready' && lead.followUp.draft_body ? lead.followUp : null;
  const [subject, setSubject] = useState(prepared?.draft_subject ?? '');
  const [body, setBody] = useState(prepared?.draft_body ?? '');
  const [initial, setInitial] = useState({ subject: prepared?.draft_subject ?? '', body: prepared?.draft_body ?? '' });
  const [source, setSource] = useState<string | null>(prepared ? 'Prepared draft' : null);
  const [handedOff, setHandedOff] = useState(false);
  const dirty = subject !== initial.subject || body !== initial.body;

  const applyTemplate = () =>
    draft.mutate(
      { mode: 'template' },
      {
        onSuccess: (result) => {
          setSubject(result.subject);
          setBody(result.body);
          setInitial({ subject: result.subject, body: result.body });
          setSource(result.templateName ?? 'Template');
        },
        onError: (error) => toast.error(error, 'Unable to prepare a draft'),
      },
    );

  // Without a prepared draft, start from the next step's template.
  const requested = useRef(false);
  useEffect(() => {
    if (prepared || requested.current) return;
    requested.current = true;
    applyTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerCloseCheck(async () => {
      if (!dirty || handedOff) return true;
      return confirm({ title: 'Discard this message?', confirmLabel: 'Discard', cancelLabel: 'Keep editing', destructive: true });
    });
    return () => registerCloseCheck(null);
  }, [registerCloseCheck, dirty, handedOff, confirm]);

  const restart = async () => {
    if (dirty && body.trim()) {
      const ok = await confirm({
        title: 'Start again from the template?',
        message: 'Your edits will be replaced.',
        confirmLabel: 'Start again',
      });
      if (!ok) return;
    }
    applyTemplate();
  };

  const openInEmail = () => {
    if (!body.trim()) return toast.show({ title: 'Write a message first', tone: 'error' });
    window.location.href = `mailto:${lead.email ?? ''}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body.trim())}`;
    setHandedOff(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(subject.trim() ? `${subject.trim()}\n\n${body.trim()}` : body.trim());
      toast.success('Message copied', 'Paste it into your email, then come back to mark it as sent.');
      setHandedOff(true);
    } catch {
      toast.show({ title: 'Unable to copy', description: 'Select the text and copy it yourself.', tone: 'error' });
    }
  };

  const markSent = () =>
    logContact.mutate(
      { channel: 'email', note: subject.trim() || 'Email' },
      {
        onSuccess: (updated) => {
          toast.success('Marked as sent', updated?.followUp ? 'The next follow-up is scheduled.' : undefined);
          onDone();
        },
        onError: (error) => toast.error(error, 'Unable to save'),
      },
    );

  const loading = draft.isPending && !body;

  return (
    <>
      <DialogBody>
        {!lead.email ? (
          <p className={styles.placeholder}>{lead.name} has no email address. Add one with Edit, or log a call instead.</p>
        ) : null}
        <div className={styles.composeMeta}>
          <span>{source ? `From: ${source}` : ' '}</span>
          <button type="button" className={styles.copy} onClick={() => void restart()} disabled={draft.isPending}>
            Start again from the template
          </button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <Skeleton height={40} />
            <Skeleton height={220} />
          </div>
        ) : (
          <>
            <TextField label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={200} />
            <TextArea
              label="Message"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={styles.composeBody}
              maxLength={5000}
            />
          </>
        )}
        <p className={styles.hint}>
          The message opens in your own email app, so it comes from your address and the reply lands in your inbox.
          Sending straight from Leads is coming soon.
        </p>
      </DialogBody>
      <DialogFooter>
        {handedOff ? (
          <div className={styles.sentBar} style={{ width: '100%' }}>
            <span>Did you send it?</span>
            <span style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => setHandedOff(false)}>
                Not yet
              </Button>
              <Button variant="primary" size="sm" loading={logContact.isPending} onClick={markSent}>
                Yes, mark as sent
              </Button>
            </span>
          </div>
        ) : (
          <>
            <Button variant="ghost" icon="copy" onClick={() => void copy()} disabled={loading}>
              Copy
            </Button>
            <Button variant="primary" icon="mail" onClick={openInEmail} disabled={loading || !lead.email}>
              Open in email app
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
