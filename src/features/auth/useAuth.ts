import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import type { AuthContextValue } from "./types";

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Provides type-safe access to auth state and methods.
 *
 * Must be used within an AuthProvider component.
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextValue with user, loading, error, and auth methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, loading, error } = useAuth();
 *
 *   if (loading) return <Spinner />;
 *   if (!user) return <LoginPage />;
 *
 *   return (
 *     <div>
 *       <p>Welcome {user.email}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Make sure your component tree is wrapped with <AuthProvider>."
    );
  }

  return context;
}
