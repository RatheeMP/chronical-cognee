import { getApiBaseUrl } from "@/lib/api/config";
import { ChronicleApiError } from "@/lib/api/errors";
import { mapFetchError } from "@/lib/api/validators";

type HttpMethod = "GET" | "POST";

type JsonRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  cache?: RequestCache;
};

/**
 * Central HTTP client for Chronicle API v1.
 * Only standard JSON headers are allowed — custom headers are intentionally unsupported
 * to prevent CORS preflight regressions.
 */
export async function apiRequest<T>(
  path: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body ? "POST" : "GET");
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      method,
      cache: options.cache,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      throw await ChronicleApiError.fromResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw mapFetchError(error);
  }
}

export async function apiRequestWithTimeout<T>(
  path: string,
  options: JsonRequestOptions & { timeoutMs: number },
): Promise<T> {
  const { timeoutMs, ...requestOptions } = options;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(ChronicleApiError.timeout()),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([
      apiRequest<T>(path, requestOptions),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
