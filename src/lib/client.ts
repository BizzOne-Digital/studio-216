/** Browser fetch helper with consistent error handling for { success, data, error } responses. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: "same-origin",
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }
  let body: { success?: boolean; data?: T; error?: string; details?: Record<string, string[]> } = {};
  try {
    body = await res.json();
  } catch {
    if (res.status === 413) throw new Error("The file is too large for the server.");
  }
  if (!res.ok || body.success === false) {
    const detail = body.details && Object.values(body.details).flat()[0];
    const err = new Error(detail || body.error || `Request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (body.data ?? (body as unknown)) as T;
}
