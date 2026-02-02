import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-700">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-medium outline-none shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white hover:shadow focus:border-blue-500 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-blue-500/5 ${error ? "border-red-500" : ""
                        } ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
