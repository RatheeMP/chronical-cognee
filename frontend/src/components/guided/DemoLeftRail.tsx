"use client";

import { Check } from "lucide-react";

import Card from "@/components/ui/Card";
import {
  DEMO_STEPS,
  journeyBottomCard,
  memorySnapshot,
  NOVA_TECH,
} from "@/lib/novaTechDemo";

type DemoLeftRailProps = {
  stepIndex: number;
  onStepSelect: (index: number) => void;
  seeding: boolean;
  seeded: boolean;
};

export default function DemoLeftRail({
  stepIndex,
  onStepSelect,
  seeding,
  seeded,
}: DemoLeftRailProps) {
  return (
    <aside className="flex h-full flex-col gap-5 border-r border-[rgb(99_102_241/0.12)] bg-[rgb(15_13_35/0.6)] p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Demo Journey
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-200">{NOVA_TECH}</p>
        {seeding && (
          <p className="mt-2 text-xs text-[#818CF8]">Loading organizational memory…</p>
        )}
        {seeded && !seeding && (
          <p className="mt-2 text-xs text-slate-500">Memory graph ready</p>
        )}
      </div>

      <nav className="space-y-1.5" aria-label="Demo journey">
        {DEMO_STEPS.map((step, index) => {
          const active = index === stepIndex;
          const complete = index < stepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepSelect(index)}
              className={`surface-interactive flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-left transition-all duration-300 ${
                active
                  ? "border border-[rgb(99_102_241/0.35)] bg-[rgb(99_102_241/0.12)] shadow-[0_0_20px_rgb(99_102_241/0.08)]"
                  : "border border-transparent hover:bg-[rgb(67_56_202/0.08)]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? "bg-[#6366F1] text-white"
                    : complete
                      ? "bg-[rgb(34_197_94/0.15)] text-emerald-400"
                      : "bg-[rgb(30_27_75/0.8)] text-slate-500"
                }`}
              >
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden /> : step.number}
              </span>
              <span
                className={`text-sm font-medium ${
                  active ? "text-slate-100" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Memory Snapshot
        </p>
        <div className="grid grid-cols-2 gap-2">
          {memorySnapshot.map((item) => (
            <div
              key={item.label}
              className="surface rounded-[var(--radius-sm)] px-3 py-2.5"
            >
              <p className="text-lg font-semibold tabular-nums text-slate-100">
                {item.count}
              </p>
              <p className="text-[11px] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="mt-auto border-[rgb(99_102_241/0.15)] bg-[rgb(30_27_75/0.25)] p-4">
        <p className="text-sm font-semibold text-slate-200">
          {journeyBottomCard.title}
        </p>
        <ul className="mt-2 space-y-0.5">
          {journeyBottomCard.lines.map((line) => (
            <li key={line} className="text-sm text-slate-400">
              {line}
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
