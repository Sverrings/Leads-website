// Shared with the iPhone app: Leads/src/lib/errors.ts (minus its logger). Change both together.


/**
 * Everything that can go wrong is converted into an AppError before it reaches
 * the UI. People see a short title and a plain-language description; the raw
 * error is logged for developers and never rendered.
 */
export type ErrorKind =
  | 'network'
  | 'auth'
  | 'permission'
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'rate_limited'
  | 'unknown';

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly title: string;
  readonly description: string;
  /** Machine-readable reason from our own server, e.g. "not_configured". */
  readonly code?: string;
  override readonly cause?: unknown;

  constructor(params: {
    kind: ErrorKind;
    title: string;
    description: string;
    code?: string;
    cause?: unknown;
  }) {
    super(params.description);
    this.name = 'AppError';
    this.kind = params.kind;
    this.title = params.title;
    this.description = params.description;
    this.code = params.code;
    this.cause = params.cause;
  }
}

export type ErrorCopy = {
  /** What failed, e.g. "Unable to save lead". */
  title: string;
  /** Used when the error itself carries nothing safe to show. */
  description?: string;
};

const NETWORK_DESCRIPTION = 'Check your connection and try again.';
const GENERIC_DESCRIPTION = 'Something went wrong on our side. Please try again.';

/**
 * Postgres error codes raised deliberately by our own SQL functions. Their
 * messages are written for people (see supabase/migrations), so they can be shown.
 */
const USER_FACING_SQL_CODES = new Set(['P0001', 'P0002', '22023', '55P03']);

const AUTH_MESSAGES: Record<string, { kind: ErrorKind; description: string }> = {
  invalid_credentials: { kind: 'auth', description: 'Email or password is incorrect.' },
  user_already_exists: {
    kind: 'conflict',
    description: 'An account with this email already exists. Sign in instead.',
  },
  email_exists: {
    kind: 'conflict',
    description: 'An account with this email already exists. Sign in instead.',
  },
  weak_password: {
    kind: 'validation',
    description: 'Choose a longer password. At least 8 characters, and harder to guess.',
  },
  email_not_confirmed: {
    kind: 'auth',
    description: 'Confirm your email first. We can send you a new code.',
  },
  over_request_rate_limit: {
    kind: 'rate_limited',
    description: 'Too many attempts. Wait a moment and try again.',
  },
  over_email_send_rate_limit: {
    kind: 'rate_limited',
    description: 'Too many emails were sent. Wait a minute, then try again.',
  },
  signup_disabled: { kind: 'permission', description: 'New sign-ups are currently disabled.' },
  session_not_found: { kind: 'auth', description: 'Your session has expired. Sign in again.' },
  same_password: {
    kind: 'validation',
    description: 'That is already your password. Choose a new one.',
  },
  provider_disabled: {
    kind: 'permission',
    description: 'This sign-in method is not set up yet. Use another way to continue.',
  },
  identity_already_exists: {
    kind: 'conflict',
    description: 'That account is already connected to a different Leads account.',
  },
  manual_linking_disabled: {
    kind: 'permission',
    description: 'Connecting sign-in methods is turned off for this project.',
  },
  single_identity_not_deletable: {
    kind: 'validation',
    description: 'Keep at least one way to sign in.',
  },
  email_address_invalid: { kind: 'validation', description: 'Enter a valid email address.' },
  otp_expired: {
    kind: 'auth',
    description: 'That code is wrong or has expired. Check the newest email, or send a new code.',
  },
  reauthentication_not_valid: {
    kind: 'auth',
    description: 'That code is wrong or has expired. Send a new one and try again.',
  },
  bad_code_verifier: {
    kind: 'auth',
    description: 'Open the link on the same phone you requested it from.',
  },
  flow_state_not_found: {
    kind: 'auth',
    description: 'This sign-in has expired. Start again.',
  },
  refresh_token_not_found: {
    kind: 'auth',
    description: 'Your session has expired. Sign in again.',
  },
};

type ErrorLike = {
  name?: unknown;
  message?: unknown;
  code?: unknown;
  status?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === 'object' && error !== null ? (error as ErrorLike) : {};
}

export function isNetworkError(error: unknown): boolean {
  const { name, message } = asErrorLike(error);
  if (name === 'FunctionsFetchError' || name === 'AuthRetryableFetchError') return true;
  return (
    typeof message === 'string' &&
    /network request failed|failed to fetch|fetch failed|networkerror|load failed/i.test(message)
  );
}

function classify(error: unknown, copy: ErrorCopy): AppError {
  if (error instanceof AppError) return error;

  const { message, code, status } = asErrorLike(error);
  const text = typeof message === 'string' ? message : '';
  const fallbackDescription = copy.description ?? GENERIC_DESCRIPTION;

  if (isNetworkError(error)) {
    return new AppError({
      kind: 'network',
      title: copy.title,
      description: NETWORK_DESCRIPTION,
      cause: error,
    });
  }

  if (typeof code === 'string') {
    const auth = AUTH_MESSAGES[code];
    if (auth) return new AppError({ ...auth, title: copy.title, cause: error });

    if (USER_FACING_SQL_CODES.has(code) && text) {
      const kind: ErrorKind =
        code === 'P0002' ? 'not_found' : code === '55P03' ? 'conflict' : 'validation';
      return new AppError({
        kind,
        title: copy.title,
        description: ensureSentence(text),
        cause: error,
      });
    }

    switch (code) {
      case '42501':
        return new AppError({
          kind: 'permission',
          title: copy.title,
          description: "You don't have access to do that.",
          cause: error,
        });
      case '23505':
        return new AppError({
          kind: 'conflict',
          title: copy.title,
          description: 'That already exists.',
          cause: error,
        });
      case '23514':
      case '22001':
      case '23502':
        return new AppError({
          kind: 'validation',
          title: copy.title,
          description: 'Some details are not valid. Check the form and try again.',
          cause: error,
        });
      case 'PGRST116':
        return new AppError({
          kind: 'not_found',
          title: copy.title,
          description: 'This item no longer exists.',
          cause: error,
        });
      case 'PGRST301':
      case 'PGRST303':
        return new AppError({
          kind: 'auth',
          title: copy.title,
          description: 'Your session has expired. Sign in again.',
          cause: error,
        });
    }
  }

  if (status === 429) {
    return new AppError({
      kind: 'rate_limited',
      title: copy.title,
      description: 'Too many attempts. Wait a moment and try again.',
      cause: error,
    });
  }

  return new AppError({
    kind: 'unknown',
    title: copy.title,
    description: fallbackDescription,
    cause: error,
  });
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** Convert anything thrown into an AppError and log the original for developers. */
export function toAppError(error: unknown, copy: ErrorCopy): AppError {
  const appError = classify(error, copy);
  if (appError.kind === 'unknown' || appError.kind === 'permission') console.error(copy.title, error);
  return appError;
}

type SupabaseResult<T> = { data: T | null; error: unknown };

/** Throws the Supabase error (if any) as an AppError. For writes that return nothing. */
export function assertOk(result: { error: unknown }, copy: ErrorCopy): void {
  if (result.error) throw toAppError(result.error, copy);
}

/** Returns data or throws. A missing row is reported as "not found". */
export function unwrap<T>(result: SupabaseResult<T>, copy: ErrorCopy): T {
  if (result.error) throw toAppError(result.error, copy);
  if (result.data === null) {
    throw new AppError({
      kind: 'not_found',
      title: copy.title,
      description: 'This item no longer exists.',
    });
  }
  return result.data;
}

/** Returns data (possibly null) or throws. For `.maybeSingle()`. */
export function unwrapMaybe<T>(result: SupabaseResult<T>, copy: ErrorCopy): T | null {
  if (result.error) throw toAppError(result.error, copy);
  return result.data;
}
