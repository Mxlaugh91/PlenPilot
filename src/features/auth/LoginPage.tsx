import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "./useAuth";

/**
 * LoginPage Component
 *
 * Provides authentication interface for PlenPilot.
 * Features:
 * - Email and password input fields
 * - Development quick-login buttons for testing
 * - Loading states during authentication
 * - Error display with dismissible alerts
 * - Responsive design (mobile + desktop)
 *
 * @example
 * ```tsx
 * function App() {
 *   const { user } = useAuth();
 *   if (!user) return <LoginPage />;
 *   return <Dashboard />;
 * }
 * ```
 */
export function LoginPage() {
  const { login, error, loading, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handle form submission (standard login)
   * Currently not used, but prepared for future implementation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    try {
      await login(email, password);
    } catch (err) {
      // Error is handled by AuthProvider and stored in context
      // Component will re-render with error state
    }
  };

  const handleQuickLogin = async (role: "admin" | "employee") => {
    // Clear any existing errors
    if (error) clearError();

    const credentials = {
      admin: { email: "admin@plen.no", password: "admin123" },
      employee: { email: "ansatt@plen.no", password: "ansatt123" },
    };

    const { email, password } = credentials[role];

    try {
      await login(email, password);
    } catch (err) {
      // Error handled by AuthProvider
      console.error("Quick login failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 p-6">
      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl">
        {/* Logo + Title Section */}
        <div className="mb-8 flex flex-col items-center gap-4">
          {/* Logo Badge */}
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-200"
            role="img"
            aria-label="PlenPilot logo"
          >
            <span className="text-2xl font-bold" aria-hidden="true">
              PP
            </span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              PlenPilot
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Velkommen tilbake
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
            role="alert"
          >
            <div className="flex items-start gap-3">
              {/* Error Icon */}
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>

              {/* Error Message */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900">
                  Innlogging feilet
                </h3>
                <p className="mt-1 text-sm text-red-700">{error.message}</p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={clearError}
                className="rounded-lg p-1 text-red-600 transition-colors hover:bg-red-100"
                aria-label="Lukk feilmelding"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <Input
            label="E-post"
            type="email"
            placeholder="din@epost.no"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
          />

          {/* Password Input */}
          <Input
            label="Passord"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            required
          />

        </form>

        {/* Development Quick Login Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            type="button"
            variant="primary"
            className="w-full py-4 text-base"
            onClick={() => handleQuickLogin("admin")}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="status"
                  aria-label="Logger inn"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Logger inn...</span>
              </div>
            ) : (
              "Logg inn som Admin"
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full py-3"
            onClick={() => handleQuickLogin("employee")}
            disabled={loading}
          >
            Logg inn som Ansatt
          </Button>
        </div>

        {/* Development Badge */}
        <div className="border-t border-slate-100 pt-4">
          <Badge variant="info" dot={false} className="mx-auto">
            Development Mode
          </Badge>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-xs text-slate-400">
          For produksjon: Bruk e-post og passord
        </p>
      </Card>
    </div>
  );
}
