// Shared with the iPhone app: Leads/src/features/templates/variables.ts. Change both together (see README).
/**
 * Placeholders a template may use. Rendering happens on the server
 * (supabase/functions/_shared/templates.ts); this list only powers the editor.
 */
export const TEMPLATE_VARIABLES = [
  { key: 'first_name', label: 'First name', example: 'John' },
  { key: 'full_name', label: 'Full name', example: 'John Hansen' },
  { key: 'company', label: 'Company', example: 'Nordic Homes AS' },
  { key: 'sender_name', label: 'Your name', example: 'Erik Solberg' },
  { key: 'business_name', label: 'Business', example: 'Solberg Renovering' },
  { key: 'signature', label: 'Signature', example: 'Erik Solberg\nSolberg Renovering' },
] as const;

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number]['key'];

export function variableToken(key: TemplateVariable): string {
  return `{{${key}}}`;
}

/** Client-side preview with example values. */
export function previewTemplate(text: string): string {
  return TEMPLATE_VARIABLES.reduce(
    (result, variable) => result.replaceAll(variableToken(variable.key), variable.example),
    text,
  );
}
