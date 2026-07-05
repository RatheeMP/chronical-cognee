"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GitBranch,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";
import type { ReasoningChain } from "@/lib/api";
import type { StructuredAnswer } from "@/lib/chronicleReasoning";
import { EMPTY_FALLBACK } from "@/lib/chronicleReasoning";

function formatTimestamp(value: string | null): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ReasoningChainPreview({ chain }: { chain: ReasoningChain }) {
  const memoryNodes = chain.nodes
    .filter((node) => node.type === "memory")
    .sort((a, b) => a.order - b.order);

  if (memoryNodes.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No reasoning path available for this answer.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {memoryNodes.map((node, index) => (
        <li key={node.id} className="flex gap-3 text-sm">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(99_102_241/0.15)] text-[10px] font-semibold text-[#818CF8]">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-slate-200">{node.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {node.preview}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EvidenceSourceItem({
  source,
}: {
  source: StructuredAnswer["evidence"][number];
}) {
  const [expanded, setExpanded] = useState(false);
  const date = formatTimestamp(source.timestamp);

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        className="surface-interactive focus-ring w-full rounded-[var(--radius-md)] px-4 py-3 text-left transition-shadow duration-300 hover:shadow-[0_0_20px_rgb(99_102_241/0.1)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-200">{source.title}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          )}
        </div>
        {expanded && (
          <div className="mt-3 border-t border-[rgb(99_102_241/0.12)] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Summary
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {source.preview}
            </p>
            {date && (
              <>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </p>
                <p className="mt-1 text-xs text-slate-500">{date}</p>
              </>
            )}
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Memory preview
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {source.content}
            </p>
          </div>
        )}
      </button>
    </li>
  );
}

function FeedbackRow() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div className="flex items-center gap-3 border-t border-[rgb(99_102_241/0.1)] pt-4">
      <span className="text-xs text-slate-500">Was this helpful?</span>
      <button
        type="button"
        onClick={() => setFeedback("up")}
        aria-label="Helpful"
        className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-colors ${
          feedback === "up"
            ? "bg-[rgb(34_197_94/0.15)] text-emerald-400"
            : "text-slate-400 hover:bg-[rgb(99_102_241/0.08)] hover:text-slate-200"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        Helpful
      </button>
      <button
        type="button"
        onClick={() => setFeedback("down")}
        aria-label="Needs improvement"
        className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-colors ${
          feedback === "down"
            ? "bg-[rgb(248_113_113/0.12)] text-red-300"
            : "text-slate-400 hover:bg-[rgb(99_102_241/0.08)] hover:text-slate-200"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
        Needs Improvement
      </button>
      <AnimatePresence>
        {feedback && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[#818CF8]"
          >
            Feedback recorded.
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChronicleAnswerView({
  answer,
  showFeedback = true,
  variant = "default",
}: {
  answer: StructuredAnswer;
  showFeedback?: boolean;
  variant?: "default" | "workspace";
}) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isWorkspace = variant === "workspace";
  const answerLabel = isWorkspace ? "Answer" : "Summary";
  const graphLabel = isWorkspace ? "Reasoning Graph" : "View Reasoning";
  const consequences =
    answer.potentialImpacts?.filter(
      (item) => item.trim() && item.trim() !== answer.recommendation.trim(),
    ) ?? [];

  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card
        className="surface-elevated border-[rgb(99_102_241/0.22)] p-6 sm:p-7 glow-subtle"
        glow
      >
        <span className="badge badge-cyan">Chronicle</span>

        <div className="mt-5 space-y-0">
          {isWorkspace && answer.confidence && (
            <div className="response-section flex items-center gap-2.5 pb-1">
              <span className="response-label">Confidence</span>
              <span
                className={`badge text-[10px] ${
                  answer.confidence === "high"
                    ? "badge-success"
                    : answer.confidence === "medium"
                      ? ""
                      : "badge-cyan"
                }`}
              >
                {answer.confidence}
              </span>
            </div>
          )}

          <section className="response-section">
            <p className="response-label">{answerLabel}</p>
            <p className="response-body-primary mt-2.5">{answer.summary}</p>
          </section>

          {answer.evidence.length > 0 && (
            <section className="response-section">
              <p className="response-label">Supporting evidence</p>
              <ul className="mt-3 space-y-2">
                {answer.evidence.map((source) => (
                  <EvidenceSourceItem key={source.id} source={source} />
                ))}
              </ul>
            </section>
          )}

          {answer.reasoning && (
            <section className="response-section">
              <p className="response-label">Reasoning</p>
              <p className="response-body mt-2.5">{answer.reasoning}</p>
            </section>
          )}

          {answer.recommendation && (
            <section className="response-section rounded-[var(--radius-md)] border border-[rgb(99_102_241/0.18)] bg-[rgb(99_102_241/0.07)] px-4 py-3.5">
              <p className="response-label">Recommendation</p>
              <p className="response-body mt-2.5 font-medium text-slate-100">
                {answer.recommendation}
              </p>
            </section>
          )}

          {isWorkspace && consequences.length > 0 && (
            <section className="response-section">
              <p className="response-label">Potential Future Consequences</p>
              <ul className="mt-3 space-y-2">
                {consequences.map((item, index) => (
                  <li key={index} className="memory-chip text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowReasoning((open) => !open)}
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-0.5 text-sm text-[#818CF8] transition-colors hover:text-[#A5B4FC]"
        >
          <GitBranch className="h-4 w-4" aria-hidden />
          {graphLabel}
          {showReasoning ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </button>

        <AnimatePresence>
          {showReasoning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-[var(--radius-md)] border border-[rgb(99_102_241/0.12)] bg-[rgb(15_13_35/0.4)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {isWorkspace ? "Reasoning Graph" : "Decision path"}
                </p>
                <div className="mt-3">
                  <ReasoningChainPreview chain={answer.chain} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showFeedback && <FeedbackRow />}
      </Card>
    </MotionDiv>
  );
}

export function ChronicleEmptyFallback({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  const { title, suggestions, footer } = EMPTY_FALLBACK;

  return (
    <Card className="surface-elevated p-6">
      <span className="badge">Chronicle</span>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{title}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Try asking about
      </p>
      <ul className="mt-2 space-y-1.5">
        {suggestions.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-slate-400">
            <span className="text-[#6366F1]">•</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-slate-500">{footer}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm text-[#818CF8] transition-colors hover:text-[#A5B4FC]"
        >
          Retry
        </button>
      )}
    </Card>
  );
}

export function ChronicleErrorFallback({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="surface-elevated p-6">
      <span className="badge">Chronicle</span>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 text-sm text-[#818CF8] transition-colors hover:text-[#A5B4FC]"
        >
          Retry
        </button>
      )}
    </Card>
  );
}
