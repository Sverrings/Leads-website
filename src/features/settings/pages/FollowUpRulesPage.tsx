'use client';

import { Button } from '@/ui/Button';
import { ErrorState, SkeletonRows } from '@/ui/Display';
import { useConfirm } from '@/ui/Dialog';
import { SelectField, Switch } from '@/ui/Field';
import { useToast } from '@/ui/Toast';

import { DELAY_OPTIONS, describeSchedule, formatDelay } from '../../sequences/delays';
import { useCreateStep, useDeleteStep, useFollowUpSequence, useUpdateSequence, useUpdateStep } from '../../sequences/hooks';
import { useTemplates } from '../../templates/hooks';
import { useCurrentWorkspace } from '../../workspace/WorkspaceProvider';
import { SettingsRow, SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

/**
 * The rules behind every lead (follow_up_sequences / follow_up_steps), so a
 * change here changes what the backend does, for the app too.
 */
export function FollowUpRulesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const { isAdmin } = useCurrentWorkspace();
  const sequenceQuery = useFollowUpSequence();
  const templates = useTemplates();
  const updateSequence = useUpdateSequence();
  const createStep = useCreateStep();
  const updateStep = useUpdateStep();
  const deleteStep = useDeleteStep();

  if (sequenceQuery.isError) {
    return (
      <ErrorState
        title="Unable to load follow-up rules"
        error={sequenceQuery.error}
        onRetry={() => void sequenceQuery.refetch()}
      />
    );
  }
  if (sequenceQuery.isPending) return <SkeletonRows rows={4} />;

  const sequence = sequenceQuery.data;
  const steps = sequence?.steps ?? [];
  const onError = (error: unknown) => toast.error(error, 'Unable to save follow-up rules');

  if (!sequence) {
    return (
      <SettingsSection title="Follow-up rules">
        <p className={styles.muted}>This workspace has no follow-up rules yet.</p>
      </SettingsSection>
    );
  }

  const delayOptions = (current: number) => {
    const options = DELAY_OPTIONS.map((option) => ({ value: String(option.minutes), label: option.label }));
    return options.some((option) => option.value === String(current))
      ? options
      : [{ value: String(current), label: formatDelay(current) }, ...options];
  };

  const templateOptions = [
    { value: '', label: 'No template (a reminder only)' },
    ...(templates.data ?? []).map((template) => ({ value: template.id, label: template.name })),
  ];

  const addStep = () => {
    const last = steps[steps.length - 1];
    createStep.mutate(
      {
        sequenceId: sequence.id,
        position: (last?.position ?? 0) + 1,
        delayMinutes: DELAY_OPTIONS.find((option) => option.label === '1 week')?.minutes ?? 10080,
        templateId: last?.template_id ?? null,
      },
      { onError },
    );
  };

  const removeStep = async (stepId: string, position: number) => {
    const ok = await confirm({
      title: `Remove follow-up #${position}?`,
      message: 'Leads waiting for this step skip to the next one.',
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (ok) deleteStep.mutate(stepId, { onError });
  };

  return (
    <>
      <SettingsSection
        title="Automatic follow-ups"
        description={
          sequence.enabled
            ? `${describeSchedule(steps.map((step) => step.delay_minutes))} Follow-ups stop when the customer replies, or the lead is marked won or lost.`
            : 'New leads are not scheduled automatically. You can still schedule follow-ups by hand.'
        }>
        <SettingsRow
          title="Follow up automatically"
          description="New leads get this schedule."
          control={
            <Switch
              checked={sequence.enabled}
              disabled={!isAdmin}
              label="Follow up automatically"
              onChange={(enabled) => updateSequence.mutate({ sequenceId: sequence.id, enabled }, { onError })}
            />
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Steps"
        description="Each step counts from the previous contact. The template is the message Leads writes for you."
        footer={
          isAdmin ? (
            <Button icon="plus" onClick={addStep} loading={createStep.isPending} disabled={steps.length >= 10}>
              Add a step
            </Button>
          ) : (
            <span className={styles.muted}>Only owners and admins can change the rules.</span>
          )
        }>
        {steps.length === 0 ? <p className={styles.muted}>No steps. Add one to start following up.</p> : null}
        {steps.map((step, index) => (
          <div key={step.id} className={styles.step} style={index === 0 ? { borderTop: 0, paddingTop: 0 } : undefined}>
            <span className={styles.stepNumber}>#{step.position}</span>
            <SelectField
              label={index === 0 ? 'After the lead is added' : 'After the previous step'}
              value={String(step.delay_minutes)}
              disabled={!isAdmin}
              options={delayOptions(step.delay_minutes)}
              onChange={(event) =>
                updateStep.mutate({ stepId: step.id, delay_minutes: Number(event.target.value) }, { onError })
              }
            />
            <SelectField
              label="Message"
              value={step.template_id ?? ''}
              disabled={!isAdmin}
              options={templateOptions}
              onChange={(event) =>
                updateStep.mutate({ stepId: step.id, template_id: event.target.value || null }, { onError })
              }
            />
            {isAdmin ? (
              <Button
                variant="ghost"
                icon="trash-2"
                aria-label={`Remove follow-up #${step.position}`}
                onClick={() => void removeStep(step.id, step.position)}
              />
            ) : (
              <span />
            )}
          </div>
        ))}
      </SettingsSection>
    </>
  );
}
