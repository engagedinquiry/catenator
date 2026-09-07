/**
 * Transport error types — pure (no parameter properties, no Angular) so the
 * compiler core and the tests can import them under Node's strip-only mode.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

export class MalformedResponseError extends Error {
  readonly raw: string;
  constructor(raw: string) {
    super('malformed model response');
    this.raw = raw;
  }
}
