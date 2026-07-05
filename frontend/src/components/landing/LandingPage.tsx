"use client";

import Link from "next/link";
import { ArrowDown, Check, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import ArchitectureVisual from "@/components/landing/ArchitectureVisual";
import DecisionLoopVisual from "@/components/landing/DecisionLoopVisual";
import DecisionSimulationVisual from "@/components/landing/DecisionSimulationVisual";
import HeroDepthLayer from "@/components/landing/HeroDepthLayer";
import NodeNetworkBackground from "@/components/landing/NodeNetworkBackground";
import ProblemCycleVisual from "@/components/landing/ProblemCycleVisual";
import RoadmapTimelineVisual from "@/components/landing/RoadmapTimelineVisual";
import LinkButton from "@/components/ui/LinkButton";
import SectionLabel from "@/components/ui/SectionLabel";

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionFade({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="pointer-events-none h-20 sm:h-28"
      style={{
        background: `linear-gradient(to bottom, ${from}, ${to})`,
      }}
      aria-hidden
    />
  );
}

const withoutChronicle = [
  "Teams search Slack, Jira and documents",
  "Context is fragmented",
  "Decisions are repeated",
  "Trade-offs are forgotten",
  "Future decisions rely on memory",
];

const withChronicle = [
  "Organizational history is connected",
  "Past trade-offs are surfaced instantly",
  "Evidence is retrieved automatically",
  "Risks are explained before decisions are made",
  "Future decisions are grounded in organizational reasoning",
];

const roadmapCurrent = [
  "Decision Intelligence",
  "Organizational Memory",
  "Memory Explorer",
  "Impact Analysis",
];

const roadmapFuture = [
  "GitHub Connector",
  "Slack Connector",
  "IDE Companion",
  "Browser Extension",
];

function HeroScrollIndicator() {
  return (
    <motion.a
      href="#problem"
      className="flex flex-col items-center gap-2 text-slate-500 transition-colors hover:text-slate-400"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArrowDown className="h-4 w-4 text-[#6366F1]/50" strokeWidth={1.5} aria-hidden />
      <span className="text-xs tracking-wide">Discover how Chronicle thinks</span>
    </motion.a>
  );
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 400], [0, 80]);
  const chroniParallax = useTransform(scrollY, [0, 400], [0, -40]);

  return (
    <div className="min-h-screen text-slate-100">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
        <NodeNetworkBackground />
        <HeroDepthLayer />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/20 via-[#0a0f1e]/40 to-[#0a0f1e]" />
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-50"
          animate={{
            background: [
              "radial-gradient(ellipse 70% 55% at 25% 25%, rgb(99 102 241 / 0.16), transparent)",
              "radial-gradient(ellipse 60% 50% at 75% 35%, rgb(56 189 248 / 0.12), transparent)",
              "radial-gradient(ellipse 70% 55% at 25% 25%, rgb(99 102 241 / 0.16), transparent)",
            ],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{ y: heroParallax }}
          className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-32 pt-20 sm:px-8"
        >
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="relative z-10 max-w-xl space-y-7 text-center lg:text-left"
            >
              <div className="absolute -inset-8 -z-10 rounded-3xl bg-[rgb(15_23_42/0.25)] blur-2xl lg:hidden" />

              <div className="flex items-center justify-center gap-2.5 lg:justify-start">
                <ChroniAvatar size="sm" interactive />
                <span className="text-lg font-semibold tracking-tight">Chronicle</span>
              </div>

              <div>
                <p className="section-label mb-3">Decision Intelligence</p>
                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  Before your next decision,
                  <br />
                  <span className="text-gradient-accent">learn from your last one.</span>
                </h1>
              </div>

              <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
                Chronicle turns past organizational decisions into guidance you
                can act on — before the next one is made.
              </p>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <LinkButton href="/dashboard">Explore Chronicle</LinkButton>
                <Link
                  href="/guided"
                  className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-[rgb(99_102_241/0.22)] px-6 py-3 text-sm font-medium text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgb(99_102_241/0.45)] hover:text-slate-200 hover:shadow-[0_8px_32px_rgb(99_102_241/0.12)] sm:w-auto"
                >
                  Interactive Demo
                </Link>
              </div>
            </motion.div>

            <motion.div
              style={{ y: chroniParallax }}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease, delay: 0.1 }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 scale-[2] rounded-full bg-[#6366F1]/15 blur-[60px] chroni-glow" />
              <div className="relative rounded-[28%] p-1 ring-1 ring-[rgb(99_102_241/0.2)] ring-offset-4 ring-offset-transparent">
                <ChroniAvatar size="lg" interactive />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="relative z-10 flex justify-center pb-12">
          <HeroScrollIndicator />
        </div>
      </section>

      <SectionFade from="rgb(10 15 30)" to="rgb(10 15 30 / 0.95)" />

      {/* ── Problem: split layout ── */}
      <Reveal>
        <section id="problem" className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel className="mb-3">The problem</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Organizations don&apos;t just lose information—
                <span className="mt-2 block text-slate-500">
                  they lose the reasoning behind decisions, leading to costly rework
                  and repeated mistakes.
                </span>
              </h2>
            </div>
            <ProblemCycleVisual />
          </div>
        </section>
      </Reveal>

      <SectionFade from="rgb(10 15 30 / 0.95)" to="rgb(15 23 42 / 0.35)" />

      {/* ── Decision Loop: full-width immersive ── */}
      <Reveal>
        <section className="relative overflow-hidden bg-[rgb(15_23_42/0.35)] py-32 sm:py-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgb(99_102_241/0.08),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
            <div className="max-w-xl">
              <SectionLabel className="mb-3">The decision loop</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Trade-offs surfaced before you commit.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Chronicle reasons over organizational history — surfacing relevant
                trade-offs and consequences while a decision is still being made.
              </p>
            </div>
            <DecisionLoopVisual />
          </div>
        </section>
      </Reveal>

      <SectionFade from="rgb(15 23 42 / 0.35)" to="rgb(10 15 30)" />

      {/* ── Difference: split comparison ── */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-36">
          <SectionLabel className="mb-3">The difference</SectionLabel>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Generic AI vs. your experience.
          </h2>

          <div className="relative mt-14 grid gap-0 sm:grid-cols-2">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="surface rounded-[var(--radius-xl)] rounded-b-none p-6 sm:rounded-r-none sm:rounded-bl-[var(--radius-xl)] sm:p-8"
            >
              <p className="mb-5 text-xs font-medium text-slate-500">Without Chronicle</p>
              <ul className="space-y-3">
                {withoutChronicle.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgb(99_102_241/0.2)] bg-[#0a0f1e] text-xs font-medium text-slate-500 sm:flex">
              vs
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
              className="surface-elevated glow-subtle rounded-[var(--radius-xl)] rounded-t-none border-[rgb(99_102_241/0.15)] p-6 sm:rounded-l-none sm:rounded-tr-[var(--radius-xl)] sm:p-8"
            >
              <p className="mb-5 text-xs font-medium text-[#818CF8]">With Chronicle</p>
              <ul className="space-y-3">
                {withChronicle.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#818CF8]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <Link
            href="/guided"
            className="mt-8 inline-flex text-sm text-slate-500 transition-colors duration-300 hover:text-[#818CF8]"
          >
            See Chronicle reason through a real decision →
          </Link>
        </section>
      </Reveal>

      {/* ── In Practice: visual centerpiece ── */}
      <Reveal delay={0.05}>
        <section className="relative overflow-hidden border-y border-[rgb(99_102_241/0.08)] py-36 sm:py-44">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgb(99_102_241/0.1),transparent)]" />
          <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
            <div className="mb-2 text-center lg:mb-4">
              <SectionLabel className="mb-3">In practice</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                What to revisit before you decide.
              </h2>
            </div>
            <DecisionSimulationVisual />
          </div>
        </section>
      </Reveal>

      {/* ── Architecture: split ── */}
      <Reveal>
        <section className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-36">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionLabel className="mb-3">Architecture</SectionLabel>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                From activity to guidance.
              </h2>
              <p className="mt-8 max-w-sm text-xs leading-relaxed text-slate-500">
                <span className="font-medium text-slate-400">Future vision.</span>{" "}
                Chronicle&apos;s event-driven architecture is designed to learn
                continuously from organizational activity — with GitHub, Slack, and
                IDE workflows planned as future sources of decision context.
              </p>
            </div>
            <ArchitectureVisual />
          </div>
        </section>
      </Reveal>

      {/* ── Roadmap: evolution timeline ── */}
      <Reveal>
        <section className="mx-auto max-w-4xl px-6 pb-32 pt-8 sm:px-8 sm:pb-40">
          <SectionLabel className="mb-3">Roadmap</SectionLabel>
          <div className="surface-elevated rounded-[var(--radius-xl)] p-8 sm:p-10">
            <RoadmapTimelineVisual current={roadmapCurrent} future={roadmapFuture} />
          </div>
        </section>
      </Reveal>

      {/* ── Bottom CTA ── */}
      <Reveal>
        <section className="mx-auto max-w-3xl px-6 py-32 text-center sm:px-8 sm:py-36">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop repeating yesterday&apos;s mistakes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            See how Chronicle transforms organizational memory into better future
            decisions.
          </p>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/dashboard">Explore Chronicle</LinkButton>
          </div>
        </section>
      </Reveal>

      {/* ── End ── */}
      <footer className="border-t border-[rgb(99_102_241/0.08)] px-6 py-28 text-center sm:py-36">
        <Reveal>
          <p className="mx-auto max-w-md text-xl font-medium leading-relaxed tracking-tight text-slate-300 sm:text-2xl">
            Chronicle doesn&apos;t exist to store the past.
            <span className="mt-3 block text-lg text-slate-500 sm:text-xl">
              It exists to help you make better decisions going forward.
            </span>
          </p>
          <div className="mt-14 flex items-center justify-center gap-2 opacity-50">
            <ChroniAvatar size="sm" interactive={false} />
            <span className="text-sm font-medium text-slate-400">Chronicle</span>
          </div>
          <p className="mt-8 text-xs text-slate-600">
            © {new Date().getFullYear()} Chronicle
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
