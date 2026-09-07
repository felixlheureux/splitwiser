/** An API failure, thrown by the Worker or reconstructed from an HTTP response. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly current?: unknown;

  constructor(
    code: string,
    message: string,
    status: number,
    fieldErrors?: Record<string, string[]>,
    current?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.current = current;
  }
}
