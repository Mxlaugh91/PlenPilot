import { createContext } from "react";
import type { AuthContextValue } from "./types";

/**
 * Authentication Context
 *
 * Provides authentication state and methods to all components in the app.
 * Use the `useAuth()` hook to access this context.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
