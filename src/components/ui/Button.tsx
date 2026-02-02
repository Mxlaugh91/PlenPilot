import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) => {

  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-blue-200",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    outline: "border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500",
    danger: "bg-white text-red-600 border border-slate-100 shadow-sm hover:bg-red-50 hover:border-red-200",
    success: "bg-white text-green-600 border border-slate-100 shadow-sm hover:bg-green-50 hover:border-green-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
    icon: "h-9 w-9 p-0"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} gap-2`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
