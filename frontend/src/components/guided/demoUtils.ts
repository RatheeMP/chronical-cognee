/** Guided Demo interaction helpers — timeouts and in-flight guards only. */

export const DEMO_INTERACTION_TIMEOUT_MS = 10_000;

export async function withInteractionTimeout<T>(
  promise: Promise<T>,
  ms: number = DEMO_INTERACTION_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("timeout")), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function isInteractionTimeout(err: unknown): boolean {
  return err instanceof Error && /timeout/i.test(err.message);
}
