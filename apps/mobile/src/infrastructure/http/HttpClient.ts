/**
 * HTTP Client
 * A typed, configurable HTTP client with authentication support
 * Follows Single Responsibility Principle - handles only HTTP communication
 */

import { API_CONFIG } from "../../config/api";
import { ENV } from "../../config/env";
import {
  HttpClientConfig,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
  ApiError,
} from "./types";

export class HttpClient {
  private readonly config: Required<Omit<HttpClientConfig, "tokenProvider" | "onUnauthorized">> &
    Pick<HttpClientConfig, "tokenProvider" | "onUnauthorized">;

  constructor(config: HttpClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? API_CONFIG.TIMEOUT,
      tokenProvider: config.tokenProvider,
      onUnauthorized: config.onUnauthorized,
      enableLogging: config.enableLogging ?? ENV.ENABLE_LOGGING,
    };
  }

  /**
   * Makes an HTTP request with automatic JSON handling
   */
  async request<T>(url: string, options: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    const { method = "GET", headers = {}, body, timeout, signal } = options;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout ?? this.config.timeout
    );

    try {
      // Build headers
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Add auth token if available
      if (this.config.tokenProvider) {
        const token = await this.config.tokenProvider.getAccessToken();
        if (token) {
          requestHeaders["Authorization"] = `Bearer ${token}`;
        }
      }

      const fullUrl = url.startsWith("http") ? url : `${this.config.baseUrl}${url}`;

      this.log(`[HTTP] ${method} ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle unauthorized
      if (response.status === 401) {
        this.log("[HTTP] Unauthorized - triggering callback");
        this.config.onUnauthorized?.();
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      this.log(`[HTTP] ${response.status} ${response.statusText}`);

      // Handle error responses
      if (!response.ok) {
        const error = isJson ? (data as ApiError) : { message: data as string };
        throw HttpError.fromResponse(response, error);
      }

      return {
        data: data as T,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new HttpError("Request timeout", 408, "TIMEOUT");
        }
        throw new HttpError(error.message, 0, "NETWORK_ERROR");
      }

      throw new HttpError("Unknown error occurred", 0, "UNKNOWN");
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: Omit<HttpRequestConfig, "method" | "body">): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "GET" });
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, options?: Omit<HttpRequestConfig, "method" | "body">): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "POST", body });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown, options?: Omit<HttpRequestConfig, "method" | "body">): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "PUT", body });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: unknown, options?: Omit<HttpRequestConfig, "method" | "body">): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "PATCH", body });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: Omit<HttpRequestConfig, "method" | "body">): Promise<T> {
    const response = await this.request<T>(url, { ...options, method: "DELETE" });
    return response.data;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(message);
    }
  }
}
