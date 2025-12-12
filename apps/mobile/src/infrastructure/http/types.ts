/**
 * HTTP Client Types
 * Type definitions for the HTTP client infrastructure
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HttpError";
  }

  static fromResponse(response: Response, body?: ApiError): HttpError {
    return new HttpError(
      body?.message || response.statusText || "Request failed",
      response.status,
      body?.code,
      body?.details
    );
  }

  static isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
  }
}

export interface TokenProvider {
  getAccessToken: () => Promise<string | null>;
}

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  tokenProvider?: TokenProvider;
  onUnauthorized?: () => void;
  enableLogging?: boolean;
}
