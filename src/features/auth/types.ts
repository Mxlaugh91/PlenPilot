/**
 * Authentication Types
 *
 * Defines all TypeScript types and interfaces for the authentication system.
 * These types are designed to be compatible with Firebase Authentication
 * while supporting mock implementations during development.
 */

/**
 * User roles in the PlenPilot system
 */
export const ROLES = ["admin", "employee"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Authenticated user interface
 *
 * This structure matches the core Firebase user properties we'll need,
 * while adding our custom role property.
 */
export interface User {
  /** Unique user identifier (Firebase UID or mock ID) */
  id: string;

  /** User's email address */
  email: string;

  /** User's role in the system (admin or employee) */
  role: Role;

  /** Optional display name (for future use) */
  displayName?: string;

  /** Whether the user's email has been verified (Firebase compatibility) */
  emailVerified?: boolean;

  /** Optional profile photo URL (Firebase compatibility) */
  photoURL?: string | null;

  /** Account creation timestamp (Firebase compatibility) */
  createdAt?: Date;
}

/**
 * Authentication error codes
 * Maps to common Firebase Auth errors for consistency
 */
export type AuthErrorCode =
  | "auth/invalid-credentials"
  | "auth/user-not-found"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/email-already-in-use"
  | "auth/too-many-requests"
  | "auth/network-error"
  | "auth/unknown-error";

/**
 * Authentication error interface
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Authentication state interface
 *
 * Represents the current state of authentication in the application.
 * This structure is used by AuthProvider to manage auth state.
 */
export interface AuthState {
  /** Currently authenticated user, or null if not authenticated */
  user: User | null;

  /**
   * Loading state indicator
   * - true during initial auth check (page load)
   * - true during login/logout operations
   * - false when idle
   */
  loading: boolean;

  /**
   * Error from authentication operations
   * - null when no error
   * - AuthError object when an error occurs
   */
  error: AuthError | null;
}

/**
 * Authentication context value interface
 *
 * This is the full API exposed by AuthProvider through the AuthContext.
 * It combines the auth state with action methods.
 */
export interface AuthContextValue extends AuthState {
  /**
   * Login function
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves when login is complete
   * @throws Error if login fails
   *
   * @example
   * ```typescript
   * const { login } = useAuth();
   * await login('admin@plen.no', 'password123');
   * ```
   */
  login: (email: string, password: string) => Promise<void>;

  /**
   * Logout function
   *
   * Clears the current user session and returns to the login page.
   *
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * ```typescript
   * const { logout } = useAuth();
   * await logout();
   * ```
   */
  logout: () => Promise<void>;

  /**
   * Clear error function
   *
   * Clears the current error state. Useful for dismissing error messages.
   *
   * @example
   * ```typescript
   * const { clearError } = useAuth();
   * clearError();
   * ```
   */
  clearError: () => void;

  /**
   * Computed property for easier authentication checks
   */
  isAuthenticated: boolean;
}

/**
 * Credentials interface for login operations
 *
 * Used internally by authService for login operations.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Type guard utilities
 */

/**
 * Type guard to check if user is an admin
 */
export function isAdmin(user: User | null): user is User & { role: "admin" } {
  return user?.role === "admin";
}

/**
 * Type guard to check if user is an employee
 */
export function isEmployee(
  user: User | null
): user is User & { role: "employee" } {
  return user?.role === "employee";
}
