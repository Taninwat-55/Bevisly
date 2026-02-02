import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = "",
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        // Base styles
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

        // Variants
        const variants = {
            primary: "bg-[var(--color-brand-primary)] text-white hover:bg-blue-700 shadow-glow-primary border border-transparent hover:-translate-y-0.5",
            secondary: "bg-[var(--color-slate-800)] text-white hover:bg-[var(--color-slate-700)] shadow-md border border-transparent hover:-translate-y-0.5",
            outline: "bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-[var(--color-slate-800)]",
            ghost: "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-[var(--color-slate-800)]",
            danger: "bg-[var(--color-error)] text-white hover:bg-red-600 shadow-sm border border-transparent",
            glass: "glass-panel text-[var(--color-text)] hover:bg-white/80 dark:hover:bg-black/50 border-[var(--glass-border)]",
        };

        // Sizes
        const sizes = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0",
        };

        const variantClasses = variants[variant];
        const sizeClasses = sizes[size];

        // Combine classes
        const combinedClasses = `${baseStyles} ${variantClasses} ${sizeClasses} ${className}`;

        return (
            <button
                ref={ref}
                className={combinedClasses}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";
