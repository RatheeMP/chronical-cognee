const DEFAULT_BACKEND_URL = "http://localhost:8000";
const API_VERSION = "v1";

function normalizeBackendUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Server-side backend origin (SSR, build-time rewrites). */
export function getBackendOrigin(): string {
  return normalizeBackendUrl(
    process.env.CHRONICLE_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      DEFAULT_BACKEND_URL,
  );
}

/**
 * Single source of truth for Chronicle API base URLs.
 * Browser requests use same-origin `/api/v1` (Next.js proxy) — no cross-origin CORS.
 * Server-side requests talk directly to the backend.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `/api/${API_VERSION}`;
  }
  return `${getBackendOrigin()}/api/${API_VERSION}`;
}

export const API_VERSION_PATH = `/api/${API_VERSION}`;
