import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "nav"
  | "danger"
  | "default"
  | "outline";
export type ButtonSize = "compact" | "default" | "icon" | "sm" | "md" | "lg";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  className?: string;
};

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function buttonStyles({
  variant = "primary",
  size = "default",
  active = false,
  className,
}: ButtonStyleOptions = {}) {
  const resolvedVariant = variant === "default" ? "primary" : variant === "outline" ? "secondary" : variant;
  const base =
    "inline-flex items-center justify-center rounded-pill border font-body font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45";
  const sizes: Record<ButtonSize, string> = {
    compact: "min-h-9 px-3.5 py-1.5 text-sm",
    default: "min-h-11 px-5 py-2.5 text-sm",
    icon: "h-10 w-10 text-base",
    sm: "min-h-9 px-3.5 py-1.5 text-sm",
    md: "min-h-11 px-5 py-2.5 text-sm",
    lg: "min-h-12 px-6 py-3 text-sm",
  };
  const variants: Record<Exclude<ButtonVariant, "default" | "outline">, string> = {
    primary:
      "border-transparent bg-text-primary text-white shadow-[0_14px_28px_rgba(28,25,23,0.16)] hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_18px_34px_rgba(28,25,23,0.24)]",
    secondary:
      "border-border-default bg-white/90 text-text-secondary shadow-[0_10px_22px_rgba(28,25,23,0.08)] hover:-translate-y-0.5 hover:border-border-hover hover:bg-white hover:text-text-primary hover:shadow-[0_16px_28px_rgba(28,25,23,0.14)]",
    ghost:
      "border-transparent bg-transparent text-text-secondary hover:bg-black/[0.04] hover:text-text-primary",
    nav: active
      ? "border-transparent bg-accent/12 text-accent shadow-[0_10px_22px_rgba(225,29,72,0.12)]"
      : "border-transparent bg-transparent text-text-secondary hover:bg-black/[0.04] hover:text-text-primary",
    danger:
      "border-rose-200 bg-rose-50 text-rose-700 shadow-[0_10px_20px_rgba(190,24,93,0.08)] hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 hover:shadow-[0_16px_28px_rgba(190,24,93,0.14)]",
  };

  return cn(base, sizes[size], variants[resolvedVariant], className);
}

export const buttonVariants = buttonStyles;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
