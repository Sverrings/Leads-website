'use client';

import { useState } from 'react';

import { SelectField, TextArea, TextField } from '@/ui/Field';

import { LEAD_STATUSES, STATUS_META } from '../domain/status';
import { LEAD_SOURCES, leadFormSchema, type LeadFormOutput, type LeadFormValues } from '../schemas';
import styles from './form.module.css';

export type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

/** Validates with the same schema as the app. Returns the cleaned values or field errors. */
export function validateLead(values: LeadFormValues): { data?: LeadFormOutput; errors: LeadFormErrors } {
  const parsed = leadFormSchema.safeParse(values);
  if (parsed.success) return { data: parsed.data, errors: {} };
  const errors: LeadFormErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof LeadFormValues | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { errors };
}

export function useLeadForm(initial: LeadFormValues) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const dirty = (Object.keys(initial) as (keyof LeadFormValues)[]).some((key) => initial[key] !== values[key]);
  const set = (key: keyof LeadFormValues) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const validate = () => {
    const result = validateLead(values);
    setErrors(result.errors);
    return result.data;
  };
  return { values, errors, set, validate, dirty, reset: setValues };
}

export function LeadFields({
  form,
  autoFocus = false,
}: {
  form: ReturnType<typeof useLeadForm>;
  autoFocus?: boolean;
}) {
  const { values, errors, set } = form;
  return (
    <div className={styles.grid}>
      <TextField
        label="Name"
        placeholder="Sarah Mitchell"
        value={values.name}
        onChange={(event) => set('name')(event.target.value)}
        error={errors.name}
        maxLength={120}
        autoFocus={autoFocus}
        required
      />
      <TextField
        label="Company"
        optional
        placeholder="Mitchell Dental"
        value={values.company}
        onChange={(event) => set('company')(event.target.value)}
        error={errors.company}
        maxLength={120}
      />
      <TextField
        label="Email"
        optional
        type="email"
        placeholder="sarah@example.com"
        value={values.email}
        onChange={(event) => set('email')(event.target.value)}
        error={errors.email}
        hint="Needed for written follow-ups."
      />
      <TextField
        label="Phone"
        optional
        type="tel"
        placeholder="+47 912 34 567"
        value={values.phone}
        onChange={(event) => set('phone')(event.target.value)}
        error={errors.phone}
      />
      <div className={styles.wide}>
        <TextArea
          label="What they asked about"
          optional
          rows={3}
          placeholder="New bathroom, about 6 m², wants a quote before March"
          value={values.inquiry}
          onChange={(event) => set('inquiry')(event.target.value)}
          error={errors.inquiry}
          maxLength={5000}
        />
      </div>
      <TextField
        label="Where they found you"
        optional
        placeholder="Website, referral, Instagram…"
        list="lead-sources"
        value={values.source}
        onChange={(event) => set('source')(event.target.value)}
        error={errors.source}
        maxLength={60}
      />
      <datalist id="lead-sources">
        {LEAD_SOURCES.map((source) => (
          <option key={source} value={source} />
        ))}
      </datalist>
      <SelectField
        label="Status"
        value={values.status}
        onChange={(event) => set('status')(event.target.value)}
        options={LEAD_STATUSES.map((status) => ({ value: status, label: STATUS_META[status].label }))}
        hint={STATUS_META[values.status].description}
      />
    </div>
  );
}
