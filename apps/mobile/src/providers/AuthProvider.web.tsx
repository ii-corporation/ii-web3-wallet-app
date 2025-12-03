// Web doesn't use Privy - just pass through children
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
