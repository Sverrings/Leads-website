// Shared with the iPhone app: Leads/src/utils/strings.ts. Change both together (see README).
/** "John Hansen" -> "John". Falls back to the full value. */
export function getFirstName(name: string): string {
  const first = name.trim().split(/\s+/)[0];
  return first && first.length > 0 ? first : name.trim();
}

/** "John Hansen" -> "JH", "Nordic Homes AS" -> "NH", "ola" -> "O". */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Lowercase, accent-insensitive form used for instant search ("Søren" ~ "soren"). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/gi, 'o')
    .replace(/æ/gi, 'ae')
    .replace(/å/gi, 'a')
    .toLowerCase()
    .trim();
}

/** "1 lead", "12 leads". */
export function pluralize(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Collapses whitespace so long messages preview cleanly on one line. */
export function toSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function capitalize(value: string): string {
  return value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);
}
