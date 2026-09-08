/**
 * Shared shape for Server Action results.
 *
 * Actions return errors rather than throwing them: a thrown error in a Server
 * Action reaches the client as an opaque "An error occurred in the Server
 * Components render" with the message stripped in production, which is
 * useless to someone trying to fix a duplicate SKU. Returning the message
 * keeps it in front of them.
 */
export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  /** Field-level messages, keyed by form field name. */
  fieldErrors?: Record<string, string>;
  data?: T;
}

export function actionOk<T>(data?: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function actionFailed<T = undefined>(
  message: string,
  fieldErrors?: Record<string, string>,
): ActionResult<T> {
  return { ok: false, message, fieldErrors };
}

/** Normalises anything thrown into a message worth showing. */
export function describeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
