import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#7C3AED] text-white shadow-[0_0_24px_rgb(99_102_241/0.25),0_1px_0_rgb(255_255_255/0.1)_inset] hover:shadow-[0_0_32px_rgb(99_102_241/0.38),0_1px_0_rgb(255_255_255/0.15)_inset] hover:brightness-110 active:scale-[0.98]",
  secondary:
    "border border-[rgb(99_102_241/0.28)] bg-[rgb(12_18_32/0.55)] text-slate-100 backdrop-blur-sm hover:border-[rgb(99_102_241/0.45)] hover:bg-[rgb(30_27_75/0.42)] active:scale-[0.98]",
  danger:
    "border border-[rgb(248_113_113/0.28)] bg-[rgb(248_113_113/0.08)] text-red-300 hover:border-[rgb(248_113_113/0.45)] hover:bg-[rgb(248_113_113/0.14)] active:scale-[0.98]",
  ghost:
    "text-slate-400 hover:bg-[rgb(99_102_241/0.1)] hover:text-slate-100",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
