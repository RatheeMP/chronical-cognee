"use client";

import { AlertTriangle, GitBranch, Lightbulb, StickyNote } from "lucide-react";

import Card from "@/components/ui/Card";
import DemoMemoryExplorer from "@/components/guided/DemoMemoryExplorer";
import Spinner from "@/components/ui/Spinner";
import type { ImpactResponse, ReasoningChain } from "@/lib/api";
import {
  impactFallbackRecommendation,
  impactFallbackSummary,
  migrationImpactQuestion,
  proposedDecision,
} from "@/lib/novaTechDemo";

type DemoRightPanelProps = {
  stepIndex: number;
  chain: ReasoningChain | null;
  chainLoading: boolean;
  impact: ImpactResponse | null;
  impactLoading: boolean;
};

export default function DemoRightPanel({
  stepIndex,
  chain,
  chainLoading,
  impact,
  impactLoading,
}: DemoRightPanelProps) {
  const summary = impact?.summary ?? impactFallbackSummary;
  const recommendation =
    impact?.potential_impacts?.[0] ?? impactFallbackRecommendation;
  const memories =
    impact?.supporting_memories?.slice(0, 4) ?? [];

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-l border-[rgb(99_102_241/0.12)] bg-[rgb(15_13_35/0.45)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Reasoning Chain
      </p>

      <Card className="surface-elevated p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/90" aria-hidden />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Current decision
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">
              {proposedDecision}
            </p>
          </div>
        </div>
      </Card>

      {stepIndex >= 1 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-[#818CF8]" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Matching memories
            </p>
          </div>
          {memories.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {memories.map((m, i) => (
                <li key={i} className="memory-chip text-xs leading-relaxed">
                  {m}
                </li>
              ))}
            </ul>
          ) : chainLoading || impactLoading ? (
            <div className="mt-3">
              <Spinner label="Retrieving memories" />
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Navigate to Evidence or Impact to retrieve matching memories.
            </p>
          )}
        </Card>
      )}

      {stepIndex >= 2 && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-[#38BDF8]" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Past outcome
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {summary}
          </p>
        </Card>
      )}

      {stepIndex >= 2 && (
        <Card className="border-[rgb(99_102_241/0.2)] bg-[rgb(99_102_241/0.06)] p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#A78BFA]" aria-hidden />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Recommendation
            </p>
          </div>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-200">
            {recommendation}
          </p>
        </Card>
      )}

      <div className="flex-1">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Decision graph preview
        </p>
        {chainLoading ? (
          <Spinner label="Building reasoning path" />
        ) : chain && chain.nodes.length > 0 ? (
          <DemoMemoryExplorer chain={chain} compact />
        ) : stepIndex >= 1 ? (
          <Card className="p-4">
            <p className="text-xs text-slate-500">
              Reasoning path will appear when Chronicle analyzes{" "}
              <span className="text-slate-400">{migrationImpactQuestion.slice(0, 40)}…</span>
            </p>
          </Card>
        ) : null}
      </div>
    </aside>
  );
}
