import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "glass-hover" | "outline" | "flat";
    padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", variant = "default", padding = "md", children, ...props }, ref) => {
        // Base styles
        // bg-white dark:bg-slate-900 is standard default
        const baseStyles = "rounded-xl transition-all duration-200 overflow-hidden";

        const variants = {
            default: "bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm",
            glass: "glass-panel",
            "glass-hover": "glass-card hover:-translate-y-1 hover:shadow-lg cursor-pointer",
            outline: "bg-transparent border border-[var(--color-border)]",
            flat: "bg-[var(--color-slate-100)] dark:bg-[var(--color-slate-800)]",
        };

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        const combinedClasses = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`;

        return (
            <div ref={ref} className={combinedClasses} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={`text-xl font-bold font-display text-[var(--color-text)] ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ className = "", children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`} {...props}>{children}</p>;
}

export function CardContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={className} {...props}>{children}</div>;
}

export function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={`mt-6 pt-4 border-t border-[var(--color-border)] flex items-center ${className}`} {...props}>{children}</div>;
}
