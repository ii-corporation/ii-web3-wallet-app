// Platform-specific file resolution:
// - Metro will resolve to AuthProvider.native.tsx on iOS/Android
// - Metro will resolve to AuthProvider.web.tsx on web
// This file serves as fallback (shouldn't be used)

// Fallback export - should not be reached due to platform-specific files
export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.warn("[AuthProvider] Fallback file loaded - platform-specific file not found");
  return <>{children}</>;
}
