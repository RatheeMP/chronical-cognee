"use client";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import Spinner from "@/components/ui/Spinner";
import type { MemoryItem } from "@/types/memory";

type MemorySummaryProps = {
  items: MemoryItem[];
  datasetLabel?: string;
  loading?: boolean;
};

function countCategory(items: MemoryItem[], patterns: RegExp[]): number {
  return items.filter((item) =>
    patterns.some((pattern) => pattern.test(item.text)),
  ).length;
}

export default function MemorySummary({
  items,
  datasetLabel,
  loading = false,
}: MemorySummaryProps) {
  if (items.length === 0 && !loading) return null;

  const displayDataset =
    datasetLabel ?? items[0]?.datasetName ?? "main_dataset";
  const ready = !loading && items.length > 0;

  const decisions = countCategory(items, [/decision|ADR|Jira/i]);
  const meetings = countCategory(items, [
    /meeting|sprint planning|executive summary/i,
  ]);
  const architecture = countCategory(items, [/architecture review|ADR/i]);
  const incidents = countCategory(items, [/incident|postmortem/i]);

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated p-5 sm:p-6" glow>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Memory Summary
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Dataset:{" "}
              <span className="font-medium text-slate-200">{displayDataset}</span>
            </p>
          </div>
          {ready ? (
            <span className="badge badge-success">✓ Ready for reasoning</span>
          ) : loading ? (
            <span className="badge">Indexing…</span>
          ) : null}
        </div>

        {loading && items.length === 0 && (
          <div className="mt-5">
            <Spinner showChroni label="Pre-loading organizational memory" />
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Total Memories" value={items.length} />
            <Stat label="Decisions" value={decisions} />
            <Stat label="Meetings" value={meetings} />
            <Stat label="Architecture Reviews" value={architecture} />
            <Stat label="Incidents" value={incidents} />
          </div>
        )}
      </Card>
    </MotionDiv>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface rounded-[var(--radius-md)] px-3 py-3">
      <p className="text-xl font-semibold tabular-nums text-slate-100">{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">{label}</p>
    </div>
  );
}
