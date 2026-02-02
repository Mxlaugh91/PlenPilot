/**
 * LoadingScreen Component
 *
 * Full-screen loading indicator with spinner and message.
 * Used during authentication state initialization or other async operations.
 */

interface LoadingScreenProps {
  /** Optional message to display below spinner */
  message?: string;
}

export function LoadingScreen({ message = "Laster..." }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mb-4 flex justify-center">
          <svg
            className="h-12 w-12 animate-spin text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label={message}
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
        </div>
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
}
