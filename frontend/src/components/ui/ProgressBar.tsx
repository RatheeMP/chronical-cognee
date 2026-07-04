type ProgressBarProps = {
  label?: string;
};

export default function ProgressBar({ label }: ProgressBarProps) {
  return (
    <div
      className="space-y-2.5"
      role="progressbar"
      aria-label={label ?? "Loading"}
    >
      {label && (
        <p className="text-xs font-medium tracking-wide text-slate-500">
          {label}
        </p>
      )}
      <div className="h-px overflow-hidden rounded-full bg-[rgb(99_102_241/0.12)]">
        <div className="h-px w-1/3 animate-progress-indeterminate rounded-full bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#38BDF8]" />
      </div>
    </div>
  );
}
