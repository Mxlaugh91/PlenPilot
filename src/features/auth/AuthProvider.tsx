import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthContextValue, AuthState, User, AuthError } from "./types";
import { authService } from "./authService";

/**
 * Local storage key for persisting user session
 */
const STORAGE_KEY = "plenpilot_user";

/**
 * Authentication Context
 *
 * Provides authentication state and methods to all components in the app.
 * Use the `useAuth()` hook to access this context.
 */
import { AuthContext } from "./AuthContext";

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 *
 * Manages global authentication state using React Context API.
 * Handles:
 * - User authentication state
 * - Login/logout operations
 * - Session persistence (localStorage)
 * - Loading states
 * - Error handling
 *
 * This component wraps the entire application to provide auth context.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Authentication state
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true, // Start as loading to check for persisted session
    error: null,
  });

  /**
   * Initialize auth state on mount
   * Checks localStorage for persisted session
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY);

        if (storedUser) {
          const user: User = JSON.parse(storedUser);

          // Validate stored user has required fields
          if (user.id && user.email && user.role) {
            setState({
              user,
              loading: false,
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        // Invalid JSON or corrupted data - clear storage
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(STORAGE_KEY);
      }

      // No valid session found
      setState({
        user: null,
        loading: false,
        error: null,
      });
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   *
   * Authenticates user with email and password.
   * On success, stores user in state and localStorage.
   *
   * @param email - User's email address
   * @param password - User's password
   * @throws AuthError if login fails - caller should handle with try/catch
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    // Set loading state
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null, // Clear any previous errors
    }));

    try {
      // Call auth service
      const user = await authService.login(email, password);

      // Store user in localStorage for persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

      // Update state
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Handle authentication error
      const authError = error as AuthError;

      setState({
        user: null,
        loading: false,
        error: authError,
      });

      // Re-throw to allow caller to handle if needed
      throw authError;
    }
  }, []);

  /**
   * Logout function
   *
   * Clears user session from state and localStorage.
   * Redirects to login page.
   */
  const logout = useCallback(async (): Promise<void> => {
    // Set loading state
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Call auth service
      await authService.logout();

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Clear state
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      // Even if logout fails, clear local state
      console.warn("Logout failed, clearing local state:", error);
      localStorage.removeItem(STORAGE_KEY);

      setState({
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Clear error function
   *
   * Clears the current error state.
   * Useful for dismissing error messages.
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  /**
   * Context value
   * Combines state with action methods
   * Memoized to prevent unnecessary re-renders
   */
  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      clearError,
      isAuthenticated: state.user !== null,
    }),
    [state, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
