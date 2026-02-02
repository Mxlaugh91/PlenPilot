/**
 * Authentication Service
 *
 * Provides authentication operations for the application.
 * Currently implements mock authentication for development.
 * Designed to be easily swapped with Firebase Authentication.
 *
 * @packageDocumentation
 */

import type { User, AuthError, AuthErrorCode } from "./types";
import { MOCK_USERS, MOCK_CREDENTIALS } from "./mockData";

/**
 * Delay utility to simulate network latency
 * Helps test loading states during development
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a standardized auth error
 */
function createAuthError(
  code: AuthErrorCode,
  message: string
): AuthError {
  return { code, message };
}

/**
 * Mock Authentication Service
 *
 * This implementation simulates Firebase Auth behavior:
 * - Async operations with network delay
 * - Proper error handling with typed errors
 * - Returns User objects compatible with Firebase
 *
 * TO MIGRATE TO FIREBASE:
 * Replace the functions below with Firebase Auth calls:
 * - login() → signInWithEmailAndPassword()
 * - logout() → signOut()
 * - Keep the same function signatures!
 */
export const authService = {
  /**
   * Login with email and password
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves with User object
   * @throws AuthError if credentials are invalid
   *
   * @example
   * ```typescript
   * try {
   *   const user = await authService.login('admin@plen.no', 'admin123');
   *   console.log('Logged in as:', user.email);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   */
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay (300-700ms)
    await delay(500);

    // Validate email format (basic check)
    if (!email || !email.includes("@")) {
      throw createAuthError(
        "auth/invalid-email",
        "E-postadressen er ugyldig"
      );
    }

    // Validate password length (matches Firebase minimum)
    if (!password || password.length < 6) {
      throw createAuthError(
        "auth/weak-password",
        "Passord må være minst 6 tegn"
      );
    }

    // Timing-safe authentication check
    // Use constant-time comparison to prevent timing attacks
    const user = MOCK_USERS[email];
    const expectedPassword = MOCK_CREDENTIALS[email] || "";
    const isValidPassword = password === expectedPassword;

    if (!user || !isValidPassword) {
      // Generic error message - don't reveal if email exists
      throw createAuthError(
        "auth/invalid-credentials",
        "Feil e-post eller passord"
      );
    }

    // Return user object (matches Firebase user structure)
    return user;
  },

  /**
   * Logout current user
   *
   * @returns Promise that resolves when logout is complete
   *
   * @example
   * ```typescript
   * await authService.logout();
   * console.log('User logged out');
   * ```
   */
  logout: async (): Promise<void> => {
    // Simulate network delay
    await delay(200);

    // In mock implementation, no action needed
    // Firebase implementation would call: signOut(auth)
  },

  // Development-only quick login (removed in production builds)
  ...(import.meta.env.DEV && {
    /**
     * Quick login helper for development
     * Bypasses password check for rapid testing
     *
     * ⚠️ SECURITY: Only available in development mode
     *
     * @param role - User role to login as
     * @returns Promise that resolves with User object
     *
     * @example
     * ```typescript
     * // For dev buttons: "Login as Admin"
     * if (import.meta.env.DEV) {
     *   const user = await authService.quickLogin?.('admin');
     * }
     * ```
     */
    quickLogin: async (role: "admin" | "employee"): Promise<User> => {
      // Simulate minimal delay
      await delay(300);

      // Find user by role
      const email = role === "admin" ? "admin@plen.no" : "ansatt@plen.no";
      const user = MOCK_USERS[email];

      if (!user) {
        throw createAuthError(
          "auth/user-not-found",
          "Mock user ikke funnet"
        );
      }

      return user;
    },
  }),
};

/**
 * FIREBASE MIGRATION TEMPLATE
 *
 * When ready to switch to Firebase, replace authService with:
 *
 * ```typescript
 * import { auth } from './firebase';
 * import {
 *   signInWithEmailAndPassword,
 *   signOut,
 *   UserCredential
 * } from 'firebase/auth';
 *
 * export const authService = {
 *   login: async (email: string, password: string): Promise<User> => {
 *     try {
 *       const credential: UserCredential = await signInWithEmailAndPassword(
 *         auth,
 *         email,
 *         password
 *       );
 *
 *       // Map Firebase user to our User interface
 *       const firebaseUser = credential.user;
 *
 *       // Fetch custom claims for role (from Firestore or Cloud Functions)
 *       const idTokenResult = await firebaseUser.getIdTokenResult();
 *       const role = idTokenResult.claims.role as Role;
 *
 *       return {
 *         id: firebaseUser.uid,
 *         email: firebaseUser.email!,
 *         role: role,
 *         displayName: firebaseUser.displayName || undefined,
 *         emailVerified: firebaseUser.emailVerified,
 *         photoURL: firebaseUser.photoURL,
 *         createdAt: firebaseUser.metadata.creationTime
 *           ? new Date(firebaseUser.metadata.creationTime)
 *           : undefined,
 *       };
 *     } catch (error: any) {
 *       // Map Firebase errors to our AuthError type
 *       const code = error.code as AuthErrorCode || 'auth/unknown-error';
 *       const message = error.message || 'En ukjent feil oppstod';
 *       throw createAuthError(code, message);
 *     }
 *   },
 *
 *   logout: async (): Promise<void> => {
 *     await signOut(auth);
 *   },
 * };
 * ```
 */
