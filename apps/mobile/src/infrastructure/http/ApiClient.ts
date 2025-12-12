/**
 * API Client
 * Singleton instance of HttpClient configured for the Zoop API
 * Provides a single point of access for all API calls
 */

import { ENV } from "../../config/env";
import { HttpClient } from "./HttpClient";
import { TokenProvider } from "./types";

// Re-export TokenProvider for external use
export type { TokenProvider } from "./types";

let apiClientInstance: HttpClient | null = null;
let tokenProviderRef: TokenProvider | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Initialize the API client with a token provider
 * Should be called once when the auth provider is ready
 */
export function initializeApiClient(
  tokenProvider: TokenProvider,
  onUnauthorized?: () => void
): void {
  tokenProviderRef = tokenProvider;
  onUnauthorizedCallback = onUnauthorized ?? null;

  apiClientInstance = new HttpClient({
    baseUrl: ENV.API_URL,
    tokenProvider: tokenProviderRef,
    onUnauthorized: onUnauthorizedCallback ?? undefined,
    enableLogging: ENV.ENABLE_LOGGING,
  });

  if (ENV.ENABLE_LOGGING) {
    console.log("[ApiClient] Initialized with base URL:", ENV.API_URL);
  }
}

/**
 * Get the API client instance
 * Throws if not initialized
 */
export function getApiClient(): HttpClient {
  if (!apiClientInstance) {
    // Create a basic client without auth for public endpoints
    apiClientInstance = new HttpClient({
      baseUrl: ENV.API_URL,
      enableLogging: ENV.ENABLE_LOGGING,
    });
  }
  return apiClientInstance;
}

/**
 * Check if the API client is initialized with auth
 */
export function isApiClientInitialized(): boolean {
  return tokenProviderRef !== null;
}

/**
 * Reset the API client (useful for logout)
 */
export function resetApiClient(): void {
  tokenProviderRef = null;
  onUnauthorizedCallback = null;
  apiClientInstance = null;

  if (ENV.ENABLE_LOGGING) {
    console.log("[ApiClient] Reset");
  }
}
