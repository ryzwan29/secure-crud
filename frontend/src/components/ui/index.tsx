import { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

// ---------- Button ----------
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary: "bg-white text-ink-900 border border-surface-border hover:bg-surface-subtle",
  danger: "bg-danger-500 text-white hover:bg-danger-600",
  ghost: "bg-transparent text-ink-700 hover:bg-surface-subtle",
};

export function Button({ variant = "primary", isLoading, disabled, className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px] ${buttonVariants[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

// ---------- Input ----------
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...rest }, ref) => {
    const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`min-h-[44px] rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500 ${
            error ? "border-danger-500" : "border-surface-border"
          } ${className}`}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs font-medium text-danger-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ---------- Select ----------
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, id, className = "", ...rest }, ref) => {
    const selectId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-700">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`min-h-[44px] rounded-lg border border-surface-border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

// ---------- Label wrapper (for non-form contexts) ----------
export function FieldLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="text-sm font-medium text-ink-700" {...props} />;
}

// ---------- Badge ----------
type BadgeTone = "neutral" | "success" | "danger" | "brand";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink-900/5 text-ink-700",
  success: "bg-success-50 text-success-500",
  danger: "bg-danger-50 text-danger-600",
  brand: "bg-brand-50 text-brand-700",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

// ---------- Spinner ----------
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} aria-hidden="true" />;
}

// ---------- EmptyState ----------
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-border bg-white px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}
