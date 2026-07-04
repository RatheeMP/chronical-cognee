import ProgressBar from "@/components/ui/ProgressBar";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-[var(--radius-sm)] bg-[rgb(99_102_241/0.06)] ${className}`}
      aria-hidden
    />
  );
}

type SkeletonCardProps = {
  label?: string;
};

export function SkeletonCard({ label = "Loading" }: SkeletonCardProps) {
  return (
    <div
      className="surface space-y-4 rounded-[var(--radius-xl)] p-6"
      aria-busy
      aria-label={label}
    >
      <ProgressBar label={label} />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-14 w-full rounded-[var(--radius-md)]" />
      <Skeleton className="h-14 w-4/5 rounded-[var(--radius-md)]" />
    </div>
  );
}
