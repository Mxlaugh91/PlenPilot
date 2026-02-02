import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "neutral" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export const Badge = ({ children, variant = "neutral", dot = true, className = "" }: BadgeProps) => {
  const styles = {
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    neutral: "bg-slate-100 text-slate-600",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700"
  };

  const dotColors = {
    success: "bg-green-600",
    warning: "bg-amber-600",
    neutral: "bg-slate-500",
    danger: "bg-red-600",
    info: "bg-blue-600"
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${styles[variant]} ${className}`}>
      {dot && <div className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </div>
  );
};
