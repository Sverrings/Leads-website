'use client';

import { useRef, useState } from 'react';

import type { MessageTemplate } from '@/lib/models';
import { toSingleLine } from '@/lib/strings';
import { Button } from '@/ui/Button';
import { EmptyState, ErrorState, SkeletonRows } from '@/ui/Display';
import { Dialog, DialogBody, DialogFooter, useConfirm } from '@/ui/Dialog';
import { TextArea, TextField } from '@/ui/Field';
import { Icon } from '@/ui/Icon';
import { useToast } from '@/ui/Toast';

import { useDeleteTemplate, useSaveTemplate, useTemplates } from '../../templates/hooks';
import { templateSchema } from '../../templates/schemas';
import { previewTemplate, TEMPLATE_VARIABLES, variableToken } from '../../templates/variables';
import { useCurrentWorkspace } from '../../workspace/WorkspaceProvider';
import { SettingsSection } from '../SettingsShell';
import styles from '../settings.module.css';

type Editing = { template: MessageTemplate | null } | null;

export function TemplatesPage() {
  const { isAdmin } = useCurrentWorkspace();
  const templates = useTemplates();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <>
      <SettingsSection
        title="Message templates"
        description="The follow-ups Leads writes for you. Placeholders like {{first_name}} are filled in for each lead."
        footer={
          isAdmin ? (
            <Button icon="plus" onClick={() => setEditing({ template: null })}>
              New template
            </Button>
          ) : (
            <span className={styles.muted}>Only owners and admins can change templates.</span>
          )
        }>
        {templates.isPending ? (
          <SkeletonRows rows={3} />
        ) : templates.isError ? (
          <ErrorState title="Unable to load templates" error={templates.error} onRetry={() => void templates.refetch()} />
        ) : templates.data.length === 0 ? (
          <EmptyState icon="file-text" title="No templates yet" />
        ) : (
          <ul className={styles.templateList}>
            {templates.data.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className={styles.templateItem}
                  onClick={() => setEditing({ template })}
                  disabled={!isAdmin}>
                  <span className={styles.rowText} style={{ flex: 1 }}>
                    <span className={styles.rowTitle}>{template.name}</span>
                    <span className={styles.rowDescription}>
                      {template.subject ? `${template.subject} · ` : ''}
                      {toSingleLine(template.body).slice(0, 110)}
                    </span>
                  </span>
                  {isAdmin ? <Icon name="chevron-right" size={16} /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </SettingsSection>
      <TemplateDialog editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function TemplateDialog({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const template = editing?.template ?? null;
  return (
    <Dialog open={editing !== null} onClose={onClose} wide custom title={template ? 'Edit template' : 'New template'}>
      <TemplateEditor template={template} onClose={onClose} />
    </Dialog>
  );
}

/** Mounted each time the dialog opens, starting from the template as stored. */
function TemplateEditor({ template, onClose }: { template: MessageTemplate | null; onClose: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const save = useSaveTemplate(template?.id ?? null);
  const remove = useDeleteTemplate();
  const [name, setName] = useState(template?.name ?? '');
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insert = (token: string) => {
    const element = bodyRef.current;
    if (!element) {
      setBody((current) => current + token);
      return;
    }
    const start = element.selectionStart ?? body.length;
    const end = element.selectionEnd ?? body.length;
    setBody(body.slice(0, start) + token + body.slice(end));
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const submit = () => {
    const parsed = templateSchema.safeParse({ name, subject, body });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    save.mutate(parsed.data, {
      onSuccess: () => {
        toast.success(template ? 'Template saved' : 'Template added');
        onClose();
      },
      onError: (error) => toast.error(error, 'Unable to save template'),
    });
  };

  const destroy = async () => {
    if (!template) return;
    const ok = await confirm({
      title: `Delete “${template.name}”?`,
      message: 'Steps that use it become reminders without a message.',
      confirmLabel: 'Delete template',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(template.id, {
      onSuccess: () => {
        toast.success('Template deleted');
        onClose();
      },
      onError: (error) => toast.error(error, 'Unable to delete template'),
    });
  };

  return (
    <>
      <DialogBody>
        {preview ? (
          <div className={styles.preview}>
            <strong>{previewTemplate(subject) || '(no subject)'}</strong>
            {'\n\n'}
            {previewTemplate(body)}
          </div>
        ) : (
          <>
            <TextField
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={errors.name}
              maxLength={80}
              placeholder="Second follow-up"
            />
            <TextField
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              error={errors.subject}
              maxLength={200}
              placeholder="Following up on your inquiry"
            />
            <TextArea
              ref={bodyRef}
              label="Message"
              rows={9}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              error={errors.body}
              maxLength={5000}
              placeholder={'Hi {{first_name}},\n\n…'}
            />
            <div className={styles.variables} aria-label="Insert a placeholder">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  className={styles.variable}
                  onClick={() => insert(variableToken(variable.key))}>
                  {variable.label}
                </button>
              ))}
            </div>
          </>
        )}
      </DialogBody>
      <DialogFooter>
        {template ? (
          <Button variant="ghost" icon="trash-2" onClick={() => void destroy()} style={{ marginRight: 'auto' }}>
            Delete
          </Button>
        ) : null}
        <Button variant="ghost" onClick={() => setPreview((shown) => !shown)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
        <Button variant="primary" onClick={submit} loading={save.isPending}>
          Save template
        </Button>
      </DialogFooter>
    </>
  );
}
