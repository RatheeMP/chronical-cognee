"use client";

import { useCallback, useRef, useState } from "react";
import { MessageSquare, Search } from "lucide-react";

import ChronicleAnswerView, {
  ChronicleEmptyFallback,
  ChronicleErrorFallback,
} from "@/components/ChronicleAnswerView";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Input";
import ResultSlot from "@/components/ui/ResultSlot";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import {
  monitorQuestionPattern,
  monitorQuestionResponse,
  suggestionChips,
} from "@/lib/novaTechDemo";
import {
  askChronicleQuestion,
  errorMessage,
  GUIDED_DEMO_CONTEXT,
  type StructuredAnswer,
} from "@/lib/chronicleReasoning";
import type { ReasoningChain } from "@/lib/api";

export type AskExchange = {
  id: string;
  question: string;
  structured?: StructuredAnswer;
  plainAnswer?: string;
  errorType?: "offline" | "timeout" | "unavailable";
  errorMessage?: string;
  empty?: boolean;
};

type DemoAskChronicleProps = {
  onExplored: (chain: ReasoningChain) => void;
  exchanges: AskExchange[];
  onExchange: (exchange: AskExchange) => void;
  disabled?: boolean;
};

export default function DemoAskChronicle({
  onExplored,
  exchanges,
  onExchange,
  disabled = false,
}: DemoAskChronicleProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const runAsk = useCallback(
    async (trimmed: string) => {
      if (!trimmed || disabled || loading || inFlightRef.current) return;

      inFlightRef.current = true;
      setLoading(true);

      try {
        if (monitorQuestionPattern.test(trimmed)) {
          onExchange({
            id: `${Date.now()}`,
            question: trimmed,
            plainAnswer: monitorQuestionResponse,
          });
          setQuestion("");
          return;
        }

        const result = await askChronicleQuestion(trimmed, {
          context: GUIDED_DEMO_CONTEXT,
        });

        if (result.kind === "answer") {
          onExchange({
            id: `${Date.now()}`,
            question: trimmed,
            structured: result.structured,
          });
          if (result.structured.chain.nodes.length > 0) {
            onExplored(result.structured.chain);
          }
          setQuestion("");
        } else if (result.kind === "empty") {
          onExchange({
            id: `${Date.now()}`,
            question: trimmed,
            empty: true,
          });
          setQuestion("");
        } else {
          onExchange({
            id: `${Date.now()}`,
            question: trimmed,
            errorType: result.errorType,
            errorMessage: result.message,
          });
          setQuestion("");
        }
      } catch {
        onExchange({
          id: `${Date.now()}`,
          question: trimmed,
          errorType: "unavailable",
        });
        setQuestion("");
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [disabled, loading, onExchange, onExplored],
  );

  return (
    <div className="space-y-5">
      {exchanges.length > 0 && (
        <div className="space-y-4">
          {exchanges.map((item) => (
            <div key={item.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-[var(--radius-md)] bg-[rgb(67_56_202/0.18)] px-4 py-3">
                  <p className="text-sm text-slate-200">{item.question}</p>
                </div>
              </div>

              <ResultSlot minHeight={120}>
                {item.structured ? (
                  <ChronicleAnswerView
                    answer={item.structured}
                    variant="workspace"
                  />
                ) : item.plainAnswer ? (
                  <Card
                    className="surface-elevated border-[rgb(99_102_241/0.2)] p-5"
                    glow
                  >
                    <span className="badge badge-cyan">Chronicle</span>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-100">
                      {item.plainAnswer}
                    </p>
                  </Card>
                ) : item.empty ? (
                  <ChronicleEmptyFallback />
                ) : item.errorType ? (
                  <ChronicleErrorFallback
                    message={errorMessage(item.errorType, item.errorMessage)}
                    onRetry={() => void runAsk(item.question)}
                  />
                ) : null}
              </ResultSlot>
            </div>
          ))}
        </div>
      )}

      <Card className="surface-elevated space-y-4 p-5" glow>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#818CF8]" aria-hidden />
          <p className="text-sm font-semibold text-slate-200">Ask Chronicle</p>
        </div>

        <TextInput
          id="demo-question-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void runAsk(question.trim());
            }
          }}
          placeholder="Ask anything about NovaTech's decisions…"
          disabled={disabled || loading}
          aria-label="Your question"
        />

        <div className="flex flex-wrap gap-2">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuestion(chip)}
              disabled={disabled || loading}
              className="memory-chip text-left text-xs transition-colors duration-300 hover:border-[rgb(99_102_241/0.35)] hover:bg-[rgb(99_102_241/0.08)] disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <Button
          onClick={() => void runAsk(question.trim())}
          disabled={disabled || !question.trim() || loading}
        >
          <Search className="h-4 w-4" aria-hidden />
          {loading ? "Reasoning…" : "Ask Chronicle"}
        </Button>
      </Card>

      {loading && (
        <ResultSlot minHeight={120}>
          <div className="space-y-4">
            <Spinner showChroni label="Reasoning over organizational memory" />
            <SkeletonCard label="Reasoning over organizational memory" />
          </div>
        </ResultSlot>
      )}
    </div>
  );
}
