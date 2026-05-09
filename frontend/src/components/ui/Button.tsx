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
        const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        // Variants
        const variants = {
            primary: "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] border border-transparent shadow-sm",
            secondary: "bg-[var(--color-slate-800)] text-white hover:bg-[var(--color-slate-700)] border border-transparent shadow-sm",
            outline: "bg-transparent border border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]",
            ghost: "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] dark:hover:bg-[var(--color-surface-hover)]",
            danger: "bg-[var(--color-error)] text-white hover:bg-red-700 border border-transparent shadow-sm",
            glass: "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
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
