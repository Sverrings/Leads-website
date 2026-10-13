// Shared with the iPhone app: Leads/src/features/leads/schemas.ts. Change both together (see README).
import { z } from 'zod';

import type { LeadStatus } from '@/lib/models';

import { LEAD_STATUSES } from './domain/status';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[\d\s().-]{5,}$/;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} must be ${max} characters or less` });

/** Form values are plain strings; `toLeadInput` converts them for the database. */
export const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Enter a name' })
    .max(120, { error: 'Name must be 120 characters or less' }),
  email: optionalText(254, 'Email').refine((value) => value === '' || EMAIL.test(value), {
    error: 'Enter a valid email address',
  }),
  phone: optionalText(40, 'Phone').refine((value) => value === '' || PHONE.test(value), {
    error: 'Enter a valid phone number',
  }),
  company: optionalText(120, 'Company'),
  inquiry: optionalText(5000, 'Inquiry'),
  source: optionalText(60, 'Source'),
  status: z.enum(LEAD_STATUSES),
});

export type LeadFormValues = z.input<typeof leadFormSchema>;
export type LeadFormOutput = z.output<typeof leadFormSchema>;

export type LeadInput = {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  inquiry: string | null;
  source: string | null;
  status: LeadStatus;
};

const blankToNull = (value: string): string | null => (value.length > 0 ? value : null);

export function toLeadInput(values: LeadFormOutput): LeadInput {
  return {
    name: values.name,
    email: blankToNull(values.email.toLowerCase()),
    phone: blankToNull(values.phone),
    company: blankToNull(values.company),
    inquiry: blankToNull(values.inquiry),
    source: blankToNull(values.source),
    status: values.status,
  };
}

export const EMPTY_LEAD_FORM: LeadFormValues = {
  name: '',
  email: '',
  phone: '',
  company: '',
  inquiry: '',
  source: '',
  status: 'new',
};

/** Suggested sources. Free text is allowed; these just save typing. */
export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Phone',
  'Email',
  'Instagram',
  'Facebook',
  'Google',
  'Walk-in',
] as const;
