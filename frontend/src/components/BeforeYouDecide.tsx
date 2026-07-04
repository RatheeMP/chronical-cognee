"use client";

import { useState } from "react";
import { GitBranch, Lightbulb, Scale, Sparkles } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { TextInput } from "@/components/ui/Input";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import Panel from "@/components/ui/Panel";
import ResultSlot from "@/components/ui/ResultSlot";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { demoImpactPlaceholder, friendlyError } from "@/lib/demoCopy";
import {
  analyzeImpact,
  type ImpactResponse,
  type ReasoningChain,
} from "@/lib/api";

export default function BeforeYouDecide({
  onExplored,
  onAnalysisComplete,
}: {
  onExplored?: (chain: ReasoningChain) => void;
  onAnalysisComplete?: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImpactResponse | null>(null);

  async function handleAnalyze() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeImpact(trimmed);
      setResult(response);
      onExplored?.(response.reasoning_chain);

      const hasContent =
        response.summary ||
        response.supporting_memories.length > 0 ||
        response.reasoning ||
        response.potential_impacts.length > 0;

      if (hasContent) {
        onAnalysisComplete?.();
      }
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  const hasContent =
    result &&
    (result.summary ||
      result.supporting_memories.length > 0 ||
      result.reasoning ||
      result.potential_impacts.length > 0);

  const isEmpty =
    result &&
    !result.summary &&
    result.supporting_memories.length === 0 &&
    !result.reasoning &&
    result.potential_impacts.length === 0;

  return (
    <Panel
      tier="primary"
      title="Before You Decide"
      icon={<Scale className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
    >
      <Card className="surface-elevated content-stable space-y-5">
        <TextInput
          id="impact-question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAnalyze();
          }}
          placeholder={demoImpactPlaceholder}
          disabled={loading}
          aria-label="Decision question"
        />
        <Button onClick={handleAnalyze} disabled={loading || !question.trim()}>
          <Sparkles className="h-4 w-4" aria-hidden />
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
        {error && <p className="text-sm text-red-400/90">{error}</p>}
      </Card>

      <ResultSlot minHeight={140}>
        {loading ? (
          <div className="space-y-4">
            <Spinner showChroni label="Chroni is thinking" />
            <SkeletonCard label="Analyzing past decisions" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={Lightbulb}
            title="No matching memory"
            description="Preserve decisions first."
          />
        ) : hasContent && result ? (
          <MotionDiv
            {...fadeInUp}
            transition={transition}
            className="space-y-4"
          >
            {result.summary && (
              <Card className="surface-elevated p-6" glow>
                <span className="badge">Summary</span>
                <p className="mt-3 text-base leading-relaxed text-slate-100">
                  {result.summary}
                </p>
              </Card>
            )}
            {result.supporting_memories.length > 0 && (
              <Card className="p-6">
                <p className="mb-3 flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500">
                  <GitBranch className="h-3.5 w-3.5 text-[#818CF8]" aria-hidden />
                  Supporting memories
                </p>
                <ul className="space-y-2">
                  {result.supporting_memories.map((memory, index) => (
                    <li key={`${index}-${memory.slice(0, 24)}`} className="memory-chip">
                      {memory}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {result.reasoning && (
              <Card className="p-6">
                <span className="badge">Reasoning</span>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {result.reasoning}
                </p>
              </Card>
            )}
            {result.potential_impacts.length > 0 && (
              <Card className="p-6">
                <span className="badge badge-cyan">Lessons learned</span>
                <ul className="mt-3 space-y-2.5">
                  {result.potential_impacts.map((impact, index) => (
                    <li
                      key={`${index}-${impact.slice(0, 24)}`}
                      className="flex gap-3 text-sm text-slate-300"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6366F1]" />
                      {impact}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </MotionDiv>
        ) : null}
      </ResultSlot>
    </Panel>
  );
}
