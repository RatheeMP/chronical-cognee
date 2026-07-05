import { isChronicleApiError } from "@/lib/api/errors";

/** Initial attempt plus two retries (three total attempts). */
export const MAX_TRANSIENT_RETRIES = 2;

export const RETRY_BASE_DELAY_MS = 1000;

export function isTransientFailure(error: unknown): boolean {
  if (isChronicleApiError(error)) {
    if (error.code === "NETWORK_ERROR" || error.code === "UPSTREAM_ERROR") {
      return true;
    }
    if (error.status === 502 || error.status === 503 || error.status === 504) {
      return true;
    }
    return false;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return false;
}

export function retryDelayMs(attempt: number): number {
  return RETRY_BASE_DELAY_MS * 2 ** attempt;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function describeRetryFailure(error: unknown): string {
  if (isChronicleApiError(error)) {
    if (error.detail?.trim()) return error.detail.trim();
    if (error.message.trim()) return error.message.trim();
    return `${error.code} (${error.status})`;
  }
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export function logRetryAttempt(
  path: string,
  attempt: number,
  error: unknown,
): void {
  if (process.env.NODE_ENV !== "development") return;

  console.warn(
    `[Chronicle Retry] ${path} retry ${attempt}/${MAX_TRANSIENT_RETRIES} after transient failure:`,
    describeRetryFailure(error),
  );
}

export async function withTransientRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    path?: string;
    onRetry?: (attempt: number, error: unknown) => void;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? MAX_TRANSIENT_RETRIES;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries || !isTransientFailure(error)) {
        throw error;
      }
      if (options?.onRetry) {
        options.onRetry(attempt + 1, error);
      } else if (options?.path) {
        logRetryAttempt(options.path, attempt + 1, error);
      }
      await sleep(retryDelayMs(attempt));
    }
  }

  throw lastError;
}
