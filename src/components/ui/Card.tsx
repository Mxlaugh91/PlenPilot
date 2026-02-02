import { type ReactNode, forwardRef } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, className = "", onClick, hoverEffect = false }, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all
        ${hoverEffect || onClick ? "hover:shadow-md hover:border-blue-200 cursor-pointer hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";