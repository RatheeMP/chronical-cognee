import {
  ArrowDown,
  BookOpen,
  Brain,
  GitBranch,
  Network,
  Sparkles,
} from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import NodeNetworkBackground from "@/components/landing/NodeNetworkBackground";
import LinkButton from "@/components/ui/LinkButton";
import SectionLabel from "@/components/ui/SectionLabel";

const solution = [
  {
    title: "Preserve reasoning",
    description:
      "Chroni surfaces decisions worth remembering — the why behind every choice.",
    icon: BookOpen,
  },
  {
    title: "Reason before you decide",
    description:
      "Ask what your organization already learned before repeating past mistakes.",
    icon: Brain,
  },
  {
    title: "Trace every answer",
    description:
      "See exactly which memories informed each conclusion. No black box.",
    icon: Network,
  },
];

const lifecycle = [
  { label: "Remember", detail: "Capture decision reasoning" },
  { label: "Recall", detail: "Ask grounded questions" },
  { label: "Reason", detail: "Analyze before deciding" },
  { label: "Improve", detail: "Strengthen connections" },
  { label: "Forget", detail: "Retire outdated context" },
];

const architecture = [
  { label: "Your team", detail: "Decisions & context" },
  { label: "Chronicle", detail: "Decision intelligence layer" },
  { label: "Cognee Cloud", detail: "Organizational memory graph" },
  { label: "Outcomes", detail: "Explainable reasoning" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b divider">
        <NodeNetworkBackground />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0f1e]/70 to-[#0a0f1e]" />

        <div className="relative mx-auto flex max-w-3xl flex-col gap-10 px-6 py-28 sm:py-36">
          <div className="flex items-center gap-3 animate-fade-in">
            <ChroniAvatar size="sm" interactive={false} />
            <p className="section-label">AI Decision Intelligence</p>
          </div>
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              <span className="text-gradient">Chronicle</span>
            </h1>
            <p className="text-2xl font-medium leading-snug tracking-tight text-slate-200 sm:text-3xl">
              Remember the Past.
              <br />
              <span className="text-gradient-accent">Understand the Impact.</span>
            </p>
            <p className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              An AI decision intelligence platform powered by organizational
              memory — not a chatbot, not a note-taking app.
            </p>
          </div>
          <div className="animate-fade-in">
            <LinkButton href="/guided">Explore Chronicle</LinkButton>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <SectionLabel className="mb-5">The problem</SectionLabel>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
          Teams don&apos;t lose information.
          <span className="mt-1 block text-slate-500">
            They lose the reasoning behind decisions.
          </span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-500">
          When people leave, priorities shift, or quarters blur together, the
          context behind past choices disappears — and teams repeat expensive
          mistakes.
        </p>
      </section>

      {/* Solution */}
      <section className="border-y divider bg-[rgb(15_23_42/0.3)]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <SectionLabel className="mb-12">The solution</SectionLabel>
          <div className="space-y-10">
            {solution.map(({ title, description, icon: Icon }) => (
              <article key={title} className="flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(99_102_241/0.1)] text-[#818CF8] glow-subtle">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-100">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Cognee */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <SectionLabel className="mb-5">Why Cognee</SectionLabel>
        <div className="surface-elevated rounded-[var(--radius-xl)] p-8 glow-subtle">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(124_58_237/0.12)] text-[#A78BFA]">
            <GitBranch className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-100">
            Organizational memory needs a graph, not a folder.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Cognee Cloud connects decisions, context, and consequences into a
            living knowledge graph. Chronicle sits on top — turning that memory
            into decision intelligence you can query, analyze, and trace.
          </p>
        </div>
      </section>

      {/* Memory lifecycle */}
      <section className="border-y divider">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <SectionLabel className="mb-12">Memory lifecycle</SectionLabel>
          <div className="grid gap-8 sm:grid-cols-2">
            {lifecycle.map((step, index) => (
              <div key={step.label} className="flex gap-4">
                <span className="badge text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-200">{step.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-3xl px-6 py-24 pb-32">
        <SectionLabel className="mb-12">Architecture</SectionLabel>
        <div className="mx-auto flex max-w-sm flex-col">
          {architecture.map(({ label, detail }, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className="surface w-full rounded-[var(--radius-md)] px-5 py-4 text-center">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
              </div>
              {index < architecture.length - 1 && (
                <ArrowDown
                  className="my-2.5 h-4 w-4 text-[#6366F1]/40"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-14 flex items-center gap-3">
          <ChroniAvatar size="sm" interactive={false} />
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="h-4 w-4 text-[#38BDF8]/60" aria-hidden />
            Ready to see how Chronicle thinks?
          </p>
        </div>
      </section>
    </div>
  );
}
