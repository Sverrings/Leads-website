import type { z } from 'zod';

import { AppError, toAppError, type ErrorCopy, type ErrorKind } from './errors';
import { supabaseBrowser } from './supabase/client';

/** Edge Functions the panel may call. Service-only functions are not listed. */
export type EdgeFunctionName = 'draft-follow-up' | 'delete-account';

type FunctionErrorBody = { error?: { code?: string; message?: string } };

const KIND_BY_STATUS: Record<number, ErrorKind> = {
  400: 'validation',
  401: 'auth',
  403: 'permission',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
  429: 'rate_limited',
};

/**
 * Calls an Edge Function as the signed-in person and checks the answer's
 * shape. The functions write their error messages for people, so those are
 * shown as they are (same as the app's src/lib/functions.ts).
 */
export async function invokeFunction<TSchema extends z.ZodType>(
  name: EdgeFunctionName,
  body: Record<string, unknown>,
  schema: TSchema,
  copy: ErrorCopy,
): Promise<z.infer<TSchema>> {
  const { data, error } = await supabaseBrowser().functions.invoke(name, { body });

  if (error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      let errorBody: FunctionErrorBody | undefined;
      try {
        errorBody = (await context.json()) as FunctionErrorBody;
      } catch {
        errorBody = undefined;
      }
      const message = errorBody?.error?.message;
      if (message) {
        throw new AppError({
          kind: KIND_BY_STATUS[context.status] ?? 'unknown',
          title: copy.title,
          description: message,
          code: errorBody?.error?.code,
          cause: error,
        });
      }
    }
    throw toAppError(error, copy);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw toAppError(new Error(`Unexpected response from ${name}: ${parsed.error.message}`), copy);
  }
  return parsed.data;
}
