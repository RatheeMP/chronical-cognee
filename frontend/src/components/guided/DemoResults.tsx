"use client";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import type { ImpactResponse } from "@/lib/api";

type DemoRecallResultsProps = {
  answer: string;
};

export function DemoRecallResults({ answer }: DemoRecallResultsProps) {
  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated border-[rgb(99_102_241/0.2)] p-6" glow>
        <span className="badge badge-cyan">Recall</span>
        <p className="mt-3 text-base leading-relaxed text-slate-100">{answer}</p>
      </Card>
    </MotionDiv>
  );
}

type DemoImpactResultsProps = {
  result: ImpactResponse;
};

export function DemoImpactResults({ result }: DemoImpactResultsProps) {
  return (
    <MotionDiv {...fadeInUp} transition={transition} className="space-y-4">
      {result.summary && (
        <Card className="surface-elevated p-6" glow>
          <span className="badge">Decision impact</span>
          <p className="mt-3 text-base leading-relaxed text-slate-100">
            {result.summary}
          </p>
        </Card>
      )}

      {result.potential_impacts.length > 0 && (
        <Card className="p-6">
          <span className="badge badge-cyan">Trade-offs to consider</span>
          <ul className="mt-3 space-y-2.5">
            {result.potential_impacts.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6366F1]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.supporting_memories.length > 0 && (
        <Card className="p-6">
          <span className="badge">Supporting memories</span>
          <ul className="mt-3 space-y-2">
            {result.supporting_memories.map((m, i) => (
              <li key={i} className="memory-chip">
                {m}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.reasoning && (
        <Card className="p-6">
          <span className="badge">Organizational reasoning</span>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {result.reasoning}
          </p>
        </Card>
      )}
    </MotionDiv>
  );
}
