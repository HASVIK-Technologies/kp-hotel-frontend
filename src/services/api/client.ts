/**
 * Low-level HTTP client for the Hotel KP API. Everything else in `services/api` is built on `request()`.
 *
 * Configuration: set NEXT_PUBLIC_API_URL (e.g. https://api.kphotel.com) at build time.
 * In local development it defaults to the same host as the page, on port 4001, so cookies and CORS stay same-site.
 */
const API_PREFIX = "/api/v1";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:4001` : "http://localhost:4001")
).replace(/\/$/, "");

export const apiUrl = (path: string) => `${API_URL}${API_PREFIX}${path}`;

/** Every failed API call becomes an ApiError with the server's stable `code` and per-field messages. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

type RequestInitWithJson = RequestInit & { json?: unknown };

export async function request<T>(path: string, init: RequestInitWithJson = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...rest,
      credentials: "include",
      // x-kp-csrf makes cookie-authenticated writes a "non-simple" request, which blocks cross-site forgery.
      headers: { ...(json !== undefined ? { "content-type": "application/json" } : {}), "x-kp-csrf": "1", ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    const dev = process.env.NODE_ENV !== "production";
    throw new ApiError(
      dev ? `Can't reach the API at ${API_URL}. Start it with "npm run dev" at the repo root and try again.` : "We couldn't reach the server. Check your connection and try again.",
      0,
      "NETWORK",
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = data?.error ?? {};
    throw new ApiError(e.message ?? "Something went wrong", res.status, e.code ?? "ERROR", e.fields);
  }
  return data as T;
}

export const get = <T>(path: string) => request<T>(path);
export const post = <T>(path: string, json?: unknown) => request<T>(path, { method: "POST", json: json ?? {} });
export const patch = <T>(path: string, json: unknown) => request<T>(path, { method: "PATCH", json });
export const put = <T>(path: string, json: unknown) => request<T>(path, { method: "PUT", json });

/** Builds `?a=1&b=2`, skipping empty values. */
export const qs = (params: Record<string, string | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : "";
};
