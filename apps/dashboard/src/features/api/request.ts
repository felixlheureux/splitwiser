import { ApiError } from '@splitwiser/shared';
export { ApiError } from '@splitwiser/shared';

const apiBase = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8787').replace(/\/$/, '');

export async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...options,
      credentials: 'include',
      cache: 'no-store',
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    throw new Error('Couldn’t reach Splitwiser. Check your connection and try again.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? body?.message;
    throw new ApiError(body?.error?.code ?? body?.code ?? 'request_failed', typeof message === 'string' ? message : 'Something went wrong. Please try again.', response.status, body?.error?.fieldErrors);
  }
  return body as T;
}
