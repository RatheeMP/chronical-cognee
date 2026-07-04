"use client";

import { useState } from "react";
import { MessageSquare, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { TextInput } from "@/components/ui/Input";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import Panel from "@/components/ui/Panel";
import ResultSlot from "@/components/ui/ResultSlot";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Spinner from "@/components/ui/Spinner";
import { demoQuestionPlaceholder, friendlyError } from "@/lib/demoCopy";
import {
  recallMemory,
  exploreReasoning,
  type ReasoningChain,
  type RecallResult,
} from "@/lib/api";

function extractAnswer(results: RecallResult[]): string | null {
  for (const item of results) {
    if (typeof item.text === "string" && item.text.trim()) {
      return item.text.trim();
    }
    if (typeof item.answer === "string" && item.answer.trim()) {
      return item.answer.trim();
    }
    if (typeof item.content === "string" && item.content.trim()) {
      return item.content.trim();
    }
  }
  return null;
}

export default function AskChronicle({
  onExplored,
}: {
  onExplored?: (chain: ReasoningChain) => void;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setEmpty(false);

    try {
      const results = await recallMemory(trimmed);
      const text = extractAnswer(results);

      if (!text) {
        setEmpty(true);
      } else {
        setAnswer(text);
        try {
          const explore = await exploreReasoning(trimmed);
          onExplored?.(explore.reasoning_chain);
        } catch {
          // Explorer is best-effort; the answer above still stands.
        }
      }
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel
      tier="primary"
      title="Ask Chronicle"
      icon={<MessageSquare className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
    >
      <Card className="surface-elevated content-stable space-y-5">
        <TextInput
          id="question-input"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleAsk();
          }}
          placeholder={demoQuestionPlaceholder}
          disabled={loading}
          aria-label="Your question"
        />
        <Button onClick={handleAsk} disabled={loading || !question.trim()}>
          <Search className="h-4 w-4" aria-hidden />
          {loading ? "Searching..." : "Ask Chronicle"}
        </Button>
        {error && <p className="text-sm text-red-400/90">{error}</p>}
      </Card>

      <ResultSlot minHeight={120}>
        {loading ? (
          <div className="space-y-4">
            <Spinner showChroni label="Searching organizational memory" />
            <SkeletonCard label="Searching organizational memory" />
          </div>
        ) : empty ? (
          <EmptyState
            icon={Search}
            title="No matching memory"
            description="Preserve a decision first, then ask about it."
          />
        ) : answer ? (
          <MotionDiv {...fadeInUp} transition={transition}>
            <Card
              className="surface-elevated border-[rgb(99_102_241/0.2)] p-6 glow-subtle"
              glow
            >
              <span className="badge">Answer</span>
              <p className="mt-3 text-base leading-relaxed text-slate-100">
                {answer}
              </p>
            </Card>
          </MotionDiv>
        ) : null}
      </ResultSlot>
    </Panel>
  );
}
