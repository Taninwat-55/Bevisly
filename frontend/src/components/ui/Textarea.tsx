import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className = "", label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`w-full px-3 py-2 bg-[var(--color-surface)] border rounded-[var(--radius-input)] 
          text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] 
          transition-all duration-200 outline-none
          focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          min-h-[100px] resize-y
          ${error ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20" : "border-[var(--color-border)]"}
          ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
