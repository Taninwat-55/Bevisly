import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, leftIcon, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-[var(--color-text)] mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        className={`
              w-full rounded-lg border bg-[var(--color-input-bg)] text-[var(--color-text)]
              placeholder:text-[var(--color-slate-400)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              ${leftIcon ? "pl-10" : "px-3"}
              py-2
              ${error ? "border-[var(--color-error)] focus:ring-[var(--color-error)]/20 focus:border-[var(--color-error)]" : "border-[var(--color-input-border)]"}
              ${className}
            `}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-[var(--color-error)] animate-fade-in-up">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
