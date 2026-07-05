"use client";

import Card from "@/components/ui/Card";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

export default function ArchitectureCard() {
  return (
    <MotionDiv {...fadeInUp} transition={transition}>
      <Card className="architecture-card sticky top-24 p-6 sm:p-7" glow>
        <p className="architecture-card-title">Chronicle Architecture</p>

        <div className="mt-5 space-y-6">
          <section>
            <p className="response-label">Current Prototype</p>
            <ul className="mt-3 space-y-2.5">
              {[
                "Imported organizational memory",
                "Decision reasoning",
                "Evidence-based recommendations",
              ].map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="response-label">Production Vision</p>
            <ul className="mt-3 flex flex-wrap gap-2">
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

        <p className="mt-6 border-t border-[rgb(99_102_241/0.14)] pt-5 text-xs leading-relaxed text-slate-400">
          The reasoning engine demonstrated here is the same engine designed to
          power future event-driven integrations.
        </p>
      </Card>
    </MotionDiv>
  );
}
