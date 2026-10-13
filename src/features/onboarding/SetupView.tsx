'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { LogoMark } from '@/components/Logo';
import { AppError } from '@/lib/errors';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/ui/Button';
import { Checkbox, TextArea, TextField } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { newConsent, signOut } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';
import { useEnterWorkspace, useJoinWorkspace } from '../workspace/hooks';
import { useWorkspaceContext } from '../workspace/WorkspaceProvider';
import { completeSetup } from './api';
import { DEFAULT_RHYTHM, RHYTHMS, type RhythmId } from './rhythms';
import styles from './setup.module.css';

type Step = 'terms' | 'name' | 'rhythm' | 'lead' | 'join';
const STEPS: Step[] = ['name', 'rhythm', 'lead'];
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function message(error: unknown) {
  return error instanceof AppError ? error.description : 'Something went wrong. Try again.';
}

/**
 * Setup after the first sign-in, the same three steps as the app: the name on
 * follow-ups, how persistent they are, and a first lead so Today is useful
 * straight away. Or join a teammate's workspace with their invite code.
 */
export function SetupView() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { details, refreshDetails } = useAuth();
  const workspaces = useWorkspaceContext();
  const enter = useEnterWorkspace('owner');
  const join = useJoinWorkspace();

  const needsTerms = details ? typeof details.user_metadata?.terms_accepted_at !== 'string' : false;
  const [step, setStep] = useState<Step>('name');
  const current: Step = needsTerms && step !== 'join' ? 'terms' : step;
  const [accepted, setAccepted] = useState(false);
  const [business, setBusiness] = useState('');
  const [rhythm, setRhythm] = useState<RhythmId>(DEFAULT_RHYTHM);
  const [lead, setLead] = useState({ name: '', email: '', inquiry: '' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const index = STEPS.indexOf(current);

  const acceptTerms = async () => {
    if (!accepted) return setError('Tick the box to continue.');
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabaseBrowser().auth.updateUser({ data: newConsent() });
    if (updateError) setError('Unable to save that. Try again.');
    else await refreshDetails();
    setBusy(false);
  };

  const finish = async (withLead: boolean) => {
    setError(null);
    if (withLead) {
      if (!lead.name.trim()) return setError('Enter their name, or skip this step.');
      if (lead.email.trim() && !EMAIL.test(lead.email.trim())) return setError('Enter a valid email address.');
    }
    setBusy(true);
    try {
      const result = await completeSetup({
        businessName: business.trim(),
        rhythm,
        firstLead: withLead
          ? {
              name: lead.name.trim(),
              email: lead.email.trim() ? lead.email.trim().toLowerCase() : null,
              inquiry: lead.inquiry.trim() || null,
            }
          : null,
      });
      enter(result.workspace);
      await queryClient.invalidateQueries();
      toast.success('Workspace ready', result.leadAdded ? 'Your first lead is on Today.' : undefined);
      router.replace('/app');
    } catch (failure) {
      setError(message(failure));
      setBusy(false);
    }
  };

  const submitJoin = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!code.trim()) return setError('Enter the invite code.');
    join.mutate(code.trim().toUpperCase(), {
      onSuccess: () => router.replace('/app'),
      onError: (failure) => setError(message(failure)),
    });
  };

  const content = (() => {
    switch (current) {
      case 'terms':
        return {
          title: 'Before you start',
          subtitle: 'The short version of our terms.',
          body: (
            <>
              <ul className={styles.terms}>
                <li>You use Leads for people who asked about your work, and follow the email rules that apply to you.</li>
                <li>Customer details you add stay yours. We store them only to run Leads, and never sell them.</li>
                <li>You can delete your account and everything in it whenever you like.</li>
              </ul>
              <Checkbox checked={accepted} onChange={setAccepted}>
                I agree to the <Link href="/terms" target="_blank">terms</Link> and have read the{' '}
                <Link href="/privacy" target="_blank">privacy policy</Link>.
              </Checkbox>
            </>
          ),
          actions: (
            <Button variant="primary" size="lg" fullWidth loading={busy} onClick={() => void acceptTerms()}>
              Continue
            </Button>
          ),
        };
      case 'name':
        return {
          title: "What's your business called?",
          subtitle: 'Customers see this name on your follow-ups. You can change it later.',
          body: (
            <TextField
              label="Business name"
              placeholder="Carter Renovations"
              value={business}
              onChange={(event) => setBusiness(event.target.value)}
              maxLength={80}
              autoFocus
            />
          ),
          actions: (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                if (!business.trim()) return setError('Enter a name for your business.');
                setError(null);
                setStep('rhythm');
              }}>
              Continue
            </Button>
          ),
        };
      case 'rhythm':
        return {
          title: 'How persistent should follow-ups be?',
          subtitle: 'Leads reminds you on these days after someone asks. Change it any time in Settings.',
          body: (
            <div className={styles.options} role="radiogroup" aria-label="Follow-up rhythm">
              {RHYTHMS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={rhythm === option.id}
                  className={styles.option}
                  onClick={() => setRhythm(option.id)}>
                  <span className={styles.radio} />
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>
                      {option.label} <span>{option.schedule}</span>
                    </span>
                    <span className={styles.optionDescription}>{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
          ),
          actions: (
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep('lead')}>
              Continue
            </Button>
          ),
        };
      case 'lead':
        return {
          title: 'Who asked you for a quote lately?',
          subtitle: 'Add one person now and Today shows when to follow up. You can skip this.',
          body: (
            <>
              <TextField
                label="Their name"
                placeholder="Sarah Mitchell"
                value={lead.name}
                onChange={(event) => setLead({ ...lead, name: event.target.value })}
                maxLength={120}
                autoFocus
              />
              <TextField
                label="Email"
                optional
                type="email"
                placeholder="sarah@example.com"
                value={lead.email}
                onChange={(event) => setLead({ ...lead, email: event.target.value })}
              />
              <TextArea
                label="What they asked about"
                optional
                rows={3}
                placeholder="New bathroom, wants a quote before March"
                value={lead.inquiry}
                onChange={(event) => setLead({ ...lead, inquiry: event.target.value })}
                maxLength={5000}
              />
            </>
          ),
          actions: (
            <>
              <Button variant="primary" size="lg" fullWidth loading={busy} onClick={() => void finish(true)}>
                Add lead and finish
              </Button>
              <Button variant="ghost" fullWidth disabled={busy} onClick={() => void finish(false)}>
                Skip for now
              </Button>
            </>
          ),
        };
      case 'join':
      default:
        return {
          title: 'Join your team',
          subtitle: 'Ask a teammate for the invite code under Settings → Workspace & team.',
          body: (
            <form id="join" onSubmit={submitJoin}>
              <TextField
                label="Invite code"
                placeholder="ABCD-1234"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoCapitalize="characters"
                autoFocus
              />
            </form>
          ),
          actions: (
            <Button type="submit" form="join" variant="primary" size="lg" fullWidth loading={join.isPending}>
              Join workspace
            </Button>
          ),
        };
    }
  })();

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <LogoMark size={28} />
        <div className={styles.topActions}>
          {workspaces.status === 'ready' ? (
            <Link href="/app" className={styles.topLink}>
              Back to Leads
            </Link>
          ) : null}
          <button
            type="button"
            className={styles.topLink}
            // A full load, so nothing from this account stays in memory.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            onClick={() => void signOut().then(() => window.location.assign('/login'))}>
            Log out
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.card}>
          {index >= 0 ? (
            <div className={styles.progress} aria-label={`Step ${index + 1} of ${STEPS.length}`}>
              {STEPS.map((step, position) => (
                <span key={step} className={position <= index ? styles.progressDone : undefined} />
              ))}
            </div>
          ) : null}
          <header className={styles.head}>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </header>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.body}>{content.body}</div>
          <div className={styles.actions}>{content.actions}</div>
          <div className={styles.foot}>
            {index > 0 ? (
              <button type="button" className={styles.link} onClick={() => setStep(STEPS[index - 1]!)}>
                Back
              </button>
            ) : current === 'join' ? (
              <button type="button" className={styles.link} onClick={() => setStep('name')}>
                Set up a new workspace instead
              </button>
            ) : (
              <span />
            )}
            {current === 'name' ? (
              <button type="button" className={styles.link} onClick={() => setStep('join')}>
                I have an invite code
              </button>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
