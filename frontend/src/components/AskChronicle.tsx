"use client";

import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Input";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import ResultSlot from "@/components/ui/ResultSlot";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import ChronicleAnswerView, {
  ChronicleEmptyFallback,
  ChronicleErrorFallback,
} from "@/components/ChronicleAnswerView";
import {
  askChronicleQuestion,
  errorMessage,
  type StructuredAnswer,
} from "@/lib/chronicleReasoning";
import type { ReasoningChain } from "@/lib/api";

const EXAMPLE_QUESTIONS = [
  "Should we migrate our database?",
  "Why was Enterprise SSO postponed?",
  "What assumptions influenced this decision?",
  "What previous incidents should we consider?",
];

export default function AskChronicle({
  onExplored,
}: {
  onExplored?: (chain: ReasoningChain) => void;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<
    "offline" | "timeout" | "unavailable" | null
  >(null);
  const [answer, setAnswer] = useState<StructuredAnswer | null>(null);
  const [empty, setEmpty] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

  async function runAsk(trimmed: string) {
    if (!trimmed || loading) return;

    setLoading(true);
    setErrorType(null);
    setAnswer(null);
    setEmpty(false);
    setLastQuestion(trimmed);

    try {
      const result = await askChronicleQuestion(trimmed);

      if (result.kind === "answer") {
        setAnswer(result.structured);
        if (result.structured.chain.nodes.length > 0) {
          onExplored?.(result.structured.chain);
        }
      } else if (result.kind === "empty") {
        setEmpty(true);
      } else {
        setErrorType(result.errorType);
      }
    } catch {
      setErrorType("unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#818CF8]" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
            Ask Chronicle
          </h2>
          <span className="badge badge-cyan">Primary</span>
        </div>

        <Card className="surface-elevated content-stable space-y-5 p-5 sm:p-6" glow>
          <p className="text-sm text-slate-400">
            Ask unrestricted questions. Chronicle reasons only from imported
            organizational memory.
          </p>

          <TextInput
            id="question-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runAsk(question.trim());
            }}
            placeholder="Ask anything about your organizational decisions…"
            disabled={loading}
            aria-label="Your question"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setQuestion(chip)}
                disabled={loading}
                className="memory-chip text-left text-xs transition-colors duration-300 hover:border-[rgb(99_102_241/0.35)] hover:bg-[rgb(99_102_241/0.08)] disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          <Button
            onClick={() => void runAsk(question.trim())}
            disabled={loading || !question.trim()}
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? "Reasoning…" : "Ask Chronicle"}
          </Button>
        </Card>

        <ResultSlot minHeight={120}>
          {loading ? (
            <div className="space-y-4">
              <Spinner showChroni label="Reasoning over organizational memory" />
              <SkeletonCard label="Reasoning over organizational memory" />
            </div>
          ) : errorType ? (
            <ChronicleErrorFallback
              message={errorMessage(errorType)}
              onRetry={() => void runAsk(lastQuestion)}
            />
          ) : empty ? (
            <ChronicleEmptyFallback onRetry={() => void runAsk(lastQuestion)} />
          ) : answer ? (
            <ChronicleAnswerView answer={answer} variant="workspace" />
          ) : null}
        </ResultSlot>
      </div>
    </MotionDiv>
  );
}
