"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Sparkles,
} from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import ChroniGuide from "@/components/chroni/ChroniGuide";
import MemoryExplorer from "@/components/MemoryExplorer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LinkButton from "@/components/ui/LinkButton";
import { MotionDiv, MotionLi, fadeInUp, transition } from "@/components/ui/motion";
import ProgressBar from "@/components/ui/ProgressBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import ResultSlot from "@/components/ui/ResultSlot";
import Spinner from "@/components/ui/Spinner";
import SuccessBanner from "@/components/ui/SuccessBanner";
import {
  analyzeImpact,
  exploreReasoning,
  improveMemory,
  rememberMemory,
  type ImpactResponse,
  type ReasoningChain,
} from "@/lib/api";
import {
  chroniGuidedScript,
  guidedSsoQuestion,
  novaTechTimeline,
} from "@/lib/novaTechDemo";
import { friendlyError } from "@/lib/demoCopy";

type Step =
  | "welcome"
  | "timeline"
  | "setup"
  | "seeding"
  | "question"
  | "results"
  | "complete";

export default function GuidedExperience() {
  const [step, setStep] = useState<Step>("welcome");
  const [visibleTimeline, setVisibleTimeline] = useState(0);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImpactResponse | null>(null);
  const [chain, setChain] = useState<ReasoningChain | null>(null);
  const [improved, setImproved] = useState(false);

  const revealTimeline = useCallback(() => {
    setStep("timeline");
    setVisibleTimeline(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleTimeline(count);
      if (count >= novaTechTimeline.length) {
        window.clearInterval(timer);
      }
    }, 450);
    return () => window.clearInterval(timer);
  }, []);

  async function seedMemories() {
    setStep("seeding");
    setSeedError(null);
    setSeedingProgress(0);

    try {
      for (let i = 0; i < novaTechTimeline.length; i += 1) {
        const response = await rememberMemory(novaTechTimeline[i].memoryText);
        if (response.status !== "completed") {
          throw new Error("Failed to preserve memory");
        }
        setSeedingProgress(i + 1);
      }

      await improveMemory("main_dataset");
      setImproved(true);
      setStep("question");
    } catch (err) {
      setSeedError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
      setStep("setup");
    }
  }

  async function handleAsk() {
    setLoading(true);
    setResult(null);
    setChain(null);

    try {
      const response = await analyzeImpact(guidedSsoQuestion);
      setResult(response);
      setChain(response.reasoning_chain);
      try {
        const explore = await exploreReasoning(guidedSsoQuestion);
        if (explore.reasoning_chain.nodes.length > 0) {
          setChain(explore.reasoning_chain);
        }
      } catch {
        // Best-effort explorer enrichment
      }
      setStep("results");
    } catch (err) {
      setSeedError(
        friendlyError(err instanceof Error ? err.message : "Something went wrong"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10 sm:py-14">
      <header className="mb-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChroniAvatar size="sm" interactive={false} />
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-100">
              Chronicle
            </p>
            <p className="text-xs text-slate-500">Guided experience</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="text-xs text-slate-500 transition-colors duration-300 hover:text-[#818CF8]"
        >
          Skip to workspace
        </Link>
      </header>

      <div className="space-y-12">
        {step === "welcome" && (
          <Card className="surface-elevated p-8 sm:p-10" glow>
            <ChroniGuide message={chroniGuidedScript.welcome}>
              <Button onClick={revealTimeline}>
                Begin
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </ChroniGuide>
          </Card>
        )}

        {step === "timeline" && (
          <div className="space-y-10 content-enter">
            <ChroniGuide message={chroniGuidedScript.timeline} size="md" />
            <ol className="timeline-rail relative space-y-0 border-l pl-6">
              {novaTechTimeline.map((entry, index) => (
                <MotionLi
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: index < visibleTimeline ? 1 : 0.12,
                    x: index < visibleTimeline ? 0 : -4,
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative pb-8 last:pb-0"
                >
                  <span
                    className="timeline-dot absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full"
                    aria-hidden
                  />
                  <Card padding="sm">
                    <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" aria-hidden />
                      {entry.date}
                    </div>
                    <h3 className="font-semibold tracking-tight text-slate-100">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">{entry.preview}</p>
                  </Card>
                </MotionLi>
              ))}
            </ol>
            {visibleTimeline >= novaTechTimeline.length && (
              <MotionDiv {...fadeInUp} transition={transition}>
                <Button onClick={() => setStep("setup")}>Continue</Button>
              </MotionDiv>
            )}
          </div>
        )}

        {step === "setup" && (
          <Card className="surface-elevated p-8 content-enter" glow>
            <ChroniGuide message={chroniGuidedScript.ssoSetup}>
              {seedError && (
                <p className="text-sm text-red-400/90">{seedError}</p>
              )}
              <Button onClick={seedMemories}>
                Prepare organizational memory
                <Sparkles className="h-4 w-4" aria-hidden />
              </Button>
            </ChroniGuide>
          </Card>
        )}

        {step === "seeding" && (
          <Card className="surface-elevated p-8 content-enter" glow>
            <ChroniGuide message={chroniGuidedScript.seeding} size="md">
              <Spinner showChroni label="Preserving memories" />
              <ProgressBar
                label={`Preserving memories (${seedingProgress}/${novaTechTimeline.length})`}
              />
            </ChroniGuide>
          </Card>
        )}

        {step === "question" && (
          <div className="space-y-8 content-enter">
            <ChroniGuide
              message={chroniGuidedScript.seedingDone}
              submessage={chroniGuidedScript.questionPrompt}
              size="md"
            />
            {improved && (
              <SuccessBanner compact message="Memory connections strengthened" />
            )}
            <Card className="surface-elevated space-y-5 p-6" glow>
              <span className="badge badge-cyan">Your question</span>
              <p className="text-lg leading-relaxed text-slate-100">
                {guidedSsoQuestion}
              </p>
              <Button onClick={handleAsk} disabled={loading}>
                {loading ? "Thinking..." : "Ask Chronicle"}
              </Button>
            </Card>
            {loading && (
              <div className="space-y-4">
                <Spinner showChroni label="Chroni is thinking" />
                <SkeletonCard label="Searching organizational memory" />
              </div>
            )}
          </div>
        )}

        {step === "results" && result && (
          <div className="space-y-12 content-enter">
            <ChroniGuide message={chroniGuidedScript.results} size="md" />

            <ResultSlot minHeight={0}>
              <div className="space-y-5">
                {result.summary && (
                  <Card className="surface-elevated p-6" glow>
                    <span className="badge">Relevant past decisions</span>
                    <p className="mt-3 text-base leading-relaxed text-slate-100">
                      {result.summary}
                    </p>
                  </Card>
                )}

                {result.potential_impacts.length > 0 && (
                  <Card className="p-6">
                    <span className="badge badge-cyan">Lessons learned</span>
                    <ul className="mt-3 space-y-2.5">
                      {result.potential_impacts.map((item, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-sm text-slate-300"
                        >
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
                    <span className="badge">Reasoning</span>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {result.reasoning}
                    </p>
                  </Card>
                )}
              </div>
            </ResultSlot>

            {chain && chain.nodes.length > 0 && (
              <MemoryExplorer chain={chain} />
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={() => setStep("complete")}>Continue</Button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <Card className="surface-elevated p-8 sm:p-10 content-enter" glow>
            <ChroniGuide message={chroniGuidedScript.celebrate}>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/dashboard">Enter workspace</LinkButton>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2.5 text-sm text-slate-500 transition-colors duration-300 hover:text-slate-300"
                >
                  Back to overview
                </Link>
              </div>
            </ChroniGuide>
          </Card>
        )}
      </div>
    </div>
  );
}
