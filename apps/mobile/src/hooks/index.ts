/**
 * Hooks Barrel Export
 * Re-exports all hooks for easy importing
 */

// Legacy auth hook (will be deprecated in favor of query hooks)
export { useAuth, createAuthHeaders, authenticatedFetch } from "./useAuth";

// React Query hooks - organized by domain
export * from "./queries";
