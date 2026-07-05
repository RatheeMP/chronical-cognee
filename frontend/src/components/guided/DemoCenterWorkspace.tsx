"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import DemoAskChronicle, { type AskExchange } from "@/components/guided/DemoAskChronicle";
import ImpactAnalysisLoading from "@/components/guided/ImpactAnalysisLoading";
import ChronicleAnswerView, {
  ChronicleEmptyFallback,
  ChronicleErrorFallback,
} from "@/components/ChronicleAnswerView";
import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import ResultSlot from "@/components/ui/ResultSlot";
import Spinner from "@/components/ui/Spinner";
import type { ReasoningChain } from "@/lib/api";
import { errorMessage, type StructuredAnswer } from "@/lib/chronicleReasoning";
import {
  hookAlert,
  novaTechEvidence,
  proposedDecision,
} from "@/lib/novaTechDemo";

const fadeEase = [0.22, 1, 0.36, 1] as const;

type DemoCenterWorkspaceProps = {
  stepIndex: number;
  impactAnswer: StructuredAnswer | null;
  impactLoading: boolean;
  impactEmpty: boolean;
  impactErrorType: "offline" | "timeout" | "unavailable" | null;
  impactErrorDetail?: string | null;
  chain: ReasoningChain | null;
  chainLoading: boolean;
  onRetryImpact: () => void;
  onExplored: (chain: ReasoningChain) => void;
  askExchanges: AskExchange[];
  onAskExchange: (exchange: AskExchange) => void;
  seeding: boolean;
};

export default function DemoCenterWorkspace({
  stepIndex,
  impactAnswer,
  impactLoading,
  impactEmpty,
  impactErrorType,
  impactErrorDetail,
  chain,
  chainLoading,
  onRetryImpact,
  onExplored,
  askExchanges,
  onAskExchange,
  seeding,
}: DemoCenterWorkspaceProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            NovaTech Workspace
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-100 sm:text-2xl">
            Decision Intelligence
          </h1>
        </div>
        <span className="badge">Live demo</span>
      </div>

      {stepIndex === 0 && <DecisionStep seeding={seeding} />}
      {stepIndex === 1 && <EvidenceStep chainLoading={chainLoading} chain={chain} />}
      {stepIndex === 2 && (
        <ImpactStep
          impactAnswer={impactAnswer}
          loading={impactLoading}
          empty={impactEmpty}
          errorType={impactErrorType}
          errorDetail={impactErrorDetail}
          onRetry={onRetryImpact}
        />
      )}
      {stepIndex === 3 && (
        <AskStep
          onExplored={onExplored}
          exchanges={askExchanges}
          onExchange={onAskExchange}
          seeding={seeding}
        />
      )}
      {stepIndex === 4 && <YourTurnStep />}
    </div>
  );
}

function DecisionStep({ seeding }: { seeding: boolean }) {
  return (
    <div className="space-y-6">
      <Card
        className="border-amber-500/25 bg-gradient-to-br from-[rgb(245_158_11/0.08)] to-[rgb(99_102_241/0.06)] p-6"
        glow
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
            <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold leading-snug text-amber-100/95">
              {hookAlert.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {hookAlert.subtext}
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <ConversationBubble role="user" text={proposedDecision} />
        <ConversationBubble
          role="chronicle"
          text="Wait. I found something important in NovaTech's organizational memory before you proceed with this database change."
        />
      </div>

      {seeding && (
        <Card className="p-4">
          <Spinner showChroni label="Indexing NovaTech organizational memory" />
        </Card>
      )}

      <Card className="surface-elevated p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What happens next
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Use <span className="text-slate-300">Next</span> to review the evidence
          Chronicle retrieved, see the impact analysis, and ask your own questions.
        </p>
      </Card>
    </div>
  );
}

function ConversationBubble({
  role,
  text,
}: {
  role: "user" | "chronicle";
  text: string;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[var(--radius-md)] bg-[rgb(67_56_202/0.2)] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Engineering proposal
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-100">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="surface-elevated max-w-[90%] border-[rgb(99_102_241/0.25)] p-5" glow>
      <span className="badge badge-cyan">Chronicle</span>
      <p className="mt-3 text-sm leading-relaxed text-slate-100">{text}</p>
    </Card>
  );
}

function EvidenceStep({
  chainLoading,
  chain,
}: {
  chainLoading: boolean;
  chain: ReasoningChain | null;
}) {
  return (
    <div className="space-y-6">
      <Card className="surface-elevated p-5" glow>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#818CF8]" aria-hidden />
          <p className="text-sm font-semibold text-slate-200">
            Chronicle retrieved evidence from organizational memory
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          These memories connect your proposed PostgreSQL → MongoDB switch to
          past NovaTech decisions, incidents, and customer feedback.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {novaTechEvidence.map((item) => (
          <Card
            key={item.id}
            className="surface-interactive p-4 transition-shadow duration-300 hover:shadow-[0_0_24px_rgb(99_102_241/0.08)]"
          >
            <span className="badge text-[10px]">{item.category}</span>
            <p className="mt-2 text-sm font-medium text-slate-100">{item.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {item.preview}
            </p>
          </Card>
        ))}
      </div>

      {chainLoading && (
        <Spinner showChroni label="Building reasoning chain" />
      )}

      {chain && chain.nodes.length > 0 && (
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Supporting memories in reasoning path
          </p>
          <ul className="mt-3 space-y-2">
            {chain.nodes
              .filter((n) => n.type === "memory")
              .slice(0, 5)
              .map((n) => (
                <li key={n.id} className="memory-chip text-xs">
                  {n.title}
                </li>
              ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function ImpactStep({
  impactAnswer,
  loading,
  empty,
  errorType,
  errorDetail,
  onRetry,
}: {
  impactAnswer: StructuredAnswer | null;
  loading: boolean;
  empty: boolean;
  errorType: "offline" | "timeout" | "unavailable" | null;
  errorDetail?: string | null;
  onRetry: () => void;
}) {
  const [completedStages, setCompletedStages] = useState(() =>
    impactAnswer ? 4 : 1,
  );
  const [longWait, setLongWait] = useState(false);
  const [showResults, setShowResults] = useState(() => Boolean(impactAnswer));
  const wasLoadingRef = useRef(!impactAnswer);

  const showResult = Boolean(impactAnswer && showResults);
  const showError = Boolean(errorType);
  const showEmpty = empty;
  const showLoadingPanel = !showResult && !showError && !showEmpty;

  useEffect(() => {
    if (!showLoadingPanel || impactAnswer) return;

    wasLoadingRef.current = true;
    setShowResults(false);
    setLongWait(false);
    setCompletedStages(1);

    const stage2 = window.setTimeout(() => {
      setCompletedStages((current) => Math.max(current, 2));
    }, 2000);
    const stage3 = window.setTimeout(() => {
      setCompletedStages((current) => Math.max(current, 3));
    }, 4500);
    const longWaitTimer = window.setTimeout(() => setLongWait(true), 8000);

    return () => {
      window.clearTimeout(stage2);
      window.clearTimeout(stage3);
      window.clearTimeout(longWaitTimer);
    };
  }, [showLoadingPanel, impactAnswer, loading]);

  useEffect(() => {
    if (loading) return;

    if (impactAnswer && wasLoadingRef.current) {
      setCompletedStages(4);
      wasLoadingRef.current = false;
      const revealTimer = window.setTimeout(() => setShowResults(true), 650);
      return () => window.clearTimeout(revealTimer);
    }

    if (impactAnswer) {
      setShowResults(true);
      setCompletedStages(4);
    }
  }, [loading, impactAnswer]);

  return (
    <div className="space-y-6">
      <Card className="surface-elevated p-5" glow>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#38BDF8]" aria-hidden />
          <p className="text-sm font-semibold text-slate-200">
            Chronicle explains the impact using organizational history
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Your previous database decision prioritized reporting consistency and
          ACID guarantees. Switching now introduces risks similar to the analytics
          migration discussed previously.
        </p>
      </Card>

      <ResultSlot minHeight={120}>
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="impact-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: fadeEase }}
            >
              <ChronicleAnswerView answer={impactAnswer!} variant="workspace" />
            </motion.div>
          ) : showError ? (
            <motion.div
              key="impact-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: fadeEase }}
            >
              <ChronicleErrorFallback
                message={errorMessage(errorType!, errorDetail ?? undefined)}
                onRetry={onRetry}
              />
            </motion.div>
          ) : showEmpty ? (
            <motion.div
              key="impact-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: fadeEase }}
            >
              <ChronicleEmptyFallback onRetry={onRetry} />
            </motion.div>
          ) : (
            <motion.div
              key="impact-loading"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: fadeEase }}
            >
              <ImpactAnalysisLoading
                completedStages={completedStages}
                longWait={longWait}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ResultSlot>
    </div>
  );
}

function AskStep({
  onExplored,
  exchanges,
  onExchange,
  seeding,
}: {
  onExplored: (chain: ReasoningChain) => void;
  exchanges: AskExchange[];
  onExchange: (exchange: AskExchange) => void;
  seeding: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card className="surface-elevated p-5" glow>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#818CF8]" aria-hidden />
          <p className="text-sm font-semibold text-slate-200">
            Ask anything — the reasoning engine is live
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Type your own question. Chronicle searches NovaTech&apos;s organizational
          memory — no scripted answers.
        </p>
      </Card>

      <DemoAskChronicle
        onExplored={onExplored}
        exchanges={exchanges}
        onExchange={onExchange}
      />
    </div>
  );
}

function YourTurnStep() {
  return (
    <div className="space-y-6">
      <Card className="surface-elevated p-8" glow>
        <span className="badge badge-success">Demo complete</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">
          Your turn
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
          Chronicle stopped a mistake before it happened, explained why using
          organizational history, and answered your questions with real reasoning —
          not a script.
        </p>
        <div className="mt-6">
          <LinkButton href="/dashboard">
            Open My Workspace
            <ArrowRight className="h-4 w-4" aria-hidden />
          </LinkButton>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm text-slate-400">
          Open the workspace to preserve your own decisions and run impact analysis
          on your organization&apos;s questions.
        </p>
      </Card>
    </div>
  );
}
