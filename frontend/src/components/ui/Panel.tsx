import type { ReactNode } from "react";

type PanelTier = "primary" | "secondary" | "tertiary";

type PanelProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  tier?: PanelTier;
  children: ReactNode;
};

const tierStyles: Record<PanelTier, string> = {
  primary:
    "text-[1.375rem] sm:text-[1.625rem] font-semibold tracking-tight text-slate-50",
  secondary:
    "text-[1.1875rem] sm:text-[1.3125rem] font-semibold tracking-tight text-slate-50",
  tertiary: "text-base font-medium text-slate-100",
};

export default function Panel({
  title,
  description,
  icon,
  tier = "primary",
  children,
}: PanelProps) {
  return (
    <section className="animate-fade-in space-y-7">
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
              tier === "primary"
                ? "bg-[rgb(99_102_241/0.12)] text-[#818CF8] glow-subtle"
                : "bg-[rgb(15_23_42/0.6)] text-slate-500"
            }`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 space-y-2">
          <h2 className={tierStyles[tier]}>{title}</h2>
          {description && (
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
