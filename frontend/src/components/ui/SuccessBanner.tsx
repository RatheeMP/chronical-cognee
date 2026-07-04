import { CheckCircle2 } from "lucide-react";

type SuccessBannerProps = {
  message: string;
  compact?: boolean;
};

export default function SuccessBanner({
  message,
  compact = false,
}: SuccessBannerProps) {
  if (compact) {
    return (
      <span
        role="status"
        className="animate-success-in badge badge-success inline-flex items-center gap-1.5 text-sm"
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {message}
      </span>
    );
  }

  return (
    <div
      role="status"
      className="animate-success-in surface flex items-center gap-3 rounded-[var(--radius-md)] border-[rgb(52_211_153/0.2)] px-4 py-3 glow-cyan"
    >
      <CheckCircle2
        className="h-4 w-4 shrink-0 text-emerald-400"
        aria-hidden
      />
      <p className="text-sm leading-relaxed text-emerald-300/90">{message}</p>
    </div>
  );
}
