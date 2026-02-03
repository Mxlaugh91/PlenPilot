/**
 * Authentication Module
 *
 * Centralized authentication system for PlenPilot.
 * Provides React components, hooks, and utilities for user authentication.
 *
 * @packageDocumentation
 */

// Components
export { AuthProvider } from "./AuthProvider";
export { AuthContext } from "./AuthContext";

// Hooks
export { useAuth } from "./useAuth";

// Services
export { authService } from "./authService";

// Types
export type {
  User,
  Role,
  AuthState,
  AuthContextValue,
  AuthError,
  AuthErrorCode,
  LoginCredentials,
} from "./types";

// Type Guards
export { isAdmin, isEmployee, ROLES } from "./types";

// Mock Data (development only)
export { MOCK_USERS, MOCK_CREDENTIALS } from "./mockData";
