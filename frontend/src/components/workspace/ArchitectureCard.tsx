"use client";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

export default function ArchitectureCard() {
  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="surface-elevated sticky top-24 p-5 sm:p-6" glow>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Chronicle Architecture
        </p>

        <div className="mt-4 space-y-5">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Prototype
            </p>
            <ul className="mt-2 space-y-2">
              {[
                "Imported organizational memory",
                "Decision reasoning",
                "Evidence-based recommendations",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Production Vision
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {["GitHub", "Slack", "Jira", "Desktop Agent", "Calendar", "OS Activity"].map(
                (item) => (
                  <li key={item} className="memory-chip text-xs">
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>
        </div>

        <p className="mt-5 border-t border-[rgb(99_102_241/0.1)] pt-4 text-xs leading-relaxed text-slate-500">
          The reasoning engine demonstrated here is the same engine designed to
          power future event-driven integrations.
        </p>
      </Card>
    </MotionDiv>
  );
}
