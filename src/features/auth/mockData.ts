/**
 * Mock Authentication Data
 *
 * This file contains mock user data for development and testing.
 * It should be tree-shaken in production builds.
 *
 * @packageDocumentation
 */

import type { User } from "./types";

/**
 * Mock user credentials for development
 *
 * SECURITY WARNING: This is for development only!
 * Never include actual passwords in production code.
 */
export const MOCK_CREDENTIALS: Record<string, string> = {
  "admin@plen.no": "admin123",
  "ansatt@plen.no": "ansatt123",
};

/**
 * Mock user data for development
 *
 * Maps email addresses to User objects.
 * Used by authService.ts for mock authentication.
 */
export const MOCK_USERS: Record<string, User> = {
  "admin@plen.no": {
    id: "mock-admin-001",
    email: "admin@plen.no",
    role: "admin",
    displayName: "Admin User",
    emailVerified: true,
    photoURL: null,
    createdAt: new Date("2026-01-01"),
  },
  "ansatt@plen.no": {
    id: "mock-employee-001",
    email: "ansatt@plen.no",
    role: "employee",
    displayName: "Ansatt User",
    emailVerified: true,
    photoURL: null,
    createdAt: new Date("2026-01-15"),
  },
};
