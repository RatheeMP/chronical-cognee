import type { PresentationMetrics } from "@/components/ui/DashboardMetrics";

type MetricsStripProps = {
  metrics: PresentationMetrics;
};

export default function MetricsStrip({ metrics }: MetricsStripProps) {
  const items = [
    { label: "Decisions", value: metrics.memoriesStored },
    { label: "Analyses", value: metrics.decisionAnalyses },
    { label: "Reasoning paths", value: metrics.reasoningPaths },
  ];

  return (
    <div className="divider flex flex-wrap gap-8 border-t pt-8">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-2.5">
          <span className="text-xs tracking-wide text-slate-500">{label}</span>
          <span className="text-sm font-medium tabular-nums text-[#818CF8]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
