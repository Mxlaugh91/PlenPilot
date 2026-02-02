import { forwardRef, type InputHTMLAttributes } from "react";

/**
 * Input component props
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;

  /** Error message to display below the input */
  error?: string;

  /** Whether the input is in an error state */
  hasError?: boolean;
}

/**
 * Input Component
 *
 * A reusable input component that matches the PlenPilot design system.
 * Supports labels, error states, and all standard HTML input attributes.
 *
 * Features:
 * - Consistent styling with Button and Card components
 * - Accessible with proper ARIA attributes
 * - Error state handling
 * - Focus states with ring animation
 * - Touch-friendly (min 48px height)
 *
 * @example
 * ```tsx
 * const [email, setEmail] = useState("");
 * <Input
 *   label="E-post"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   placeholder="din@epost.no"
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className = "",
      type = "text",
      hasError = false,
      id,
      required,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for accessibility if not provided
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = `${inputId}-error`;

    // Determine if input should show error state
    const showError = hasError || !!error;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-widest text-slate-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-required={required}
          aria-invalid={showError}
          aria-describedby={error ? errorId : undefined}
          className={`
          w-full rounded-xl border px-5 py-3 font-medium outline-none shadow-sm transition-all

          ${showError
              ? // Error state
              "border-red-300 bg-red-50 text-red-900 placeholder:text-red-400 hover:border-red-400 focus:border-red-500 focus:bg-red-50/50 focus:shadow-md focus:ring-4 focus:ring-red-500/10"
              : // Normal state
              "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white hover:shadow focus:border-blue-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-blue-500/5"
            }

          ${props.disabled
              ? "cursor-not-allowed opacity-50"
              : ""
            }

          ${className}
        `}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600"
            role="alert"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
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
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

