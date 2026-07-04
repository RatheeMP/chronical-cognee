"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  RotateCcw,
} from "lucide-react";

import type { AskExchange } from "@/components/guided/DemoAskChronicle";
import {
  DEMO_INTERACTION_TIMEOUT_MS,
  isInteractionTimeout,
  withInteractionTimeout,
} from "@/components/guided/demoUtils";
import DemoCenterWorkspace from "@/components/guided/DemoCenterWorkspace";
import DemoLeftRail from "@/components/guided/DemoLeftRail";
import DemoRightPanel from "@/components/guided/DemoRightPanel";
import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import Button from "@/components/ui/Button";
import {
  analyzeImpact,
  exploreReasoning,
  improveMemory,
  rememberMemory,
  type ImpactResponse,
  type ReasoningChain,
} from "@/lib/api";
import {
  DEMO_STEPS,
  demoFooterCopy,
  demoGracefulFallback,
  migrationImpactQuestion,
  novaTechMemoriesToSeed,
  NOVA_TECH,
} from "@/lib/novaTechDemo";

async function seedNovaTechMemories(): Promise<void> {
  for (const memory of novaTechMemoriesToSeed) {
    await rememberMemory(memory.memoryText);
  }
  try {
    await improveMemory("main_dataset");
  } catch {
    // Improve is best-effort for demo seeding.
  }
}

export default function GuidedExperience() {
  const [stepIndex, setStepIndex] = useState(0);
  const [seeding, setSeeding] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const [impact, setImpact] = useState<ImpactResponse | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);

  const [chain, setChain] = useState<ReasoningChain | null>(null);
  const [chainLoading, setChainLoading] = useState(false);

  const [askExchanges, setAskExchanges] = useState<AskExchange[]>([]);

  const impactFetched = useRef(false);
  const chainFetched = useRef(false);
  const seedStarted = useRef(false);
  const impactInFlight = useRef(false);
  const chainInFlight = useRef(false);

  const runSeed = useCallback(async () => {
    setSeeding(true);
    setSeeded(false);
    try {
      await seedNovaTechMemories();
      setSeeded(true);
    } catch {
      setSeeded(false);
    } finally {
      setSeeding(false);
    }
  }, []);

  const resetDemoState = useCallback(() => {
    setStepIndex(0);
    setImpact(null);
    setImpactError(null);
    setChain(null);
    setAskExchanges([]);
    impactFetched.current = false;
    chainFetched.current = false;
  }, []);

  const handleReplay = useCallback(() => {
    resetDemoState();
  }, [resetDemoState]);

  const fetchImpact = useCallback(async () => {
    if (impactFetched.current || impactInFlight.current) return;
    impactInFlight.current = true;
    setImpactLoading(true);
    setImpactError(null);
    try {
      const result = await withInteractionTimeout(
        analyzeImpact(migrationImpactQuestion),
        DEMO_INTERACTION_TIMEOUT_MS,
      );
      setImpact(result);
      if (result.reasoning_chain?.nodes?.length) {
        setChain(result.reasoning_chain);
      }
      impactFetched.current = true;
    } catch (err) {
      setImpactError(
        isInteractionTimeout(err)
          ? "Impact analysis is taking longer than expected."
          : demoGracefulFallback("impact"),
      );
    } finally {
      impactInFlight.current = false;
      setImpactLoading(false);
    }
  }, []);

  const fetchChain = useCallback(async () => {
    if (chainFetched.current || chainInFlight.current) return;
    chainInFlight.current = true;
    setChainLoading(true);
    try {
      const result = await withInteractionTimeout(
        exploreReasoning(migrationImpactQuestion),
        DEMO_INTERACTION_TIMEOUT_MS,
      );
      setChain(result.reasoning_chain);
      chainFetched.current = true;
    } catch {
      // Right panel handles empty chain gracefully.
    } finally {
      chainInFlight.current = false;
      setChainLoading(false);
    }
  }, []);

  useEffect(() => {
    if (seedStarted.current) return;
    seedStarted.current = true;
    void runSeed();
  }, [runSeed]);

  useEffect(() => {
    if (stepIndex === 1 && seeded && !seeding) {
      void fetchChain();
    }
  }, [stepIndex, seeded, seeding, fetchChain]);

  useEffect(() => {
    if (stepIndex === 2 && seeded && !seeding) {
      void fetchImpact();
    }
  }, [stepIndex, seeded, seeding, fetchImpact]);

  function handlePrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleNext() {
    setStepIndex((i) => Math.min(i + 1, DEMO_STEPS.length - 1));
  }

  function handleExplored(nextChain: ReasoningChain) {
    setChain(nextChain);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(8_7_20)]">
      <header className="nav-glass sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[rgb(99_102_241/0.12)] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <ChroniAvatar size="sm" interactive={false} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold tracking-tight text-slate-100">
                {NOVA_TECH}
              </p>
              <span className="badge text-[10px]">Interactive Demo</span>
            </div>
            <p className="text-xs text-slate-500">
              Step {stepIndex + 1} of {DEMO_STEPS.length} —{" "}
              {DEMO_STEPS[stepIndex].label}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className="px-3 py-2"
            onClick={handlePrev}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Button>
          <Button
            variant="ghost"
            className="px-3 py-2"
            onClick={handleNext}
            disabled={stepIndex === DEMO_STEPS.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            className="px-3 py-2"
            onClick={handleReplay}
            disabled={seeding}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Replay Demo
          </Button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm text-slate-400 transition-colors duration-300 hover:bg-[rgb(67_56_202/0.1)] hover:text-slate-200"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Exit Demo
          </Link>
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-[rgb(99_102_241/0.08)] px-4 py-2 lg:hidden">
        {DEMO_STEPS.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setStepIndex(index)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              index === stepIndex
                ? "bg-[#6366F1] text-white"
                : "bg-[rgb(30_27_75/0.6)] text-slate-400"
            }`}
          >
            {step.number}. {step.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <div className="hidden lg:block">
          <DemoLeftRail
            stepIndex={stepIndex}
            onStepSelect={setStepIndex}
            seeding={seeding}
            seeded={seeded}
          />
        </div>

        <DemoCenterWorkspace
          stepIndex={stepIndex}
          impact={impact}
          impactLoading={impactLoading}
          impactError={impactError}
          chain={chain}
          chainLoading={chainLoading}
          onRetryImpact={() => {
            impactFetched.current = false;
            impactInFlight.current = false;
            void fetchImpact();
          }}
          onExplored={handleExplored}
          askExchanges={askExchanges}
          onAskExchange={(exchange) =>
            setAskExchanges((prev) => [...prev, exchange])
          }
          seeding={seeding}
        />

        <div className="hidden lg:block">
          <DemoRightPanel
            stepIndex={stepIndex}
            chain={chain}
            chainLoading={chainLoading}
            impact={impact}
            impactLoading={impactLoading}
          />
        </div>
      </div>

      <footer className="border-t border-[rgb(99_102_241/0.1)] bg-[rgb(15_13_35/0.5)] px-6 py-4">
        <p className="text-center text-xs leading-relaxed text-slate-500">
          <span className="font-medium text-slate-400">Interactive Demo</span>
          {" — "}
          {demoFooterCopy}
        </p>
      </footer>
    </div>
  );
}
