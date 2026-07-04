"use client";

import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  "Decision",
  "Time passes",
  "People leave",
  "Context disappears",
  "The same debate",
  "The same mistake",
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ProblemCycleVisual() {
  return (
    <div className="mt-10 lg:mt-0">
      {/* Mobile: vertical */}
      <div className="mx-auto max-w-xs lg:hidden">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, ease, delay: i * 0.06 }}
            className="flex flex-col items-center"
          >
            <StepPill step={step} faded={i >= 4} />
            {i < steps.length - 1 && (
              <ArrowDown className="my-1.5 h-3.5 w-3.5 text-[#6366F1]/30" aria-hidden />
            )}
          </motion.div>
        ))}
      </div>

      {/* Desktop: winding horizontal */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-3">
          {steps.slice(0, 3).map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              whileHover={{ y: -2 }}
            >
              <StepPill step={step} faded={false} />
            </motion.div>
          ))}
        </div>
        <div className="my-2 flex justify-end pr-8">
          <ArrowDown className="h-4 w-4 rotate-[-90deg] text-[#6366F1]/25" aria-hidden />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {steps.slice(3).map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease }}
              whileHover={{ y: -2 }}
              className={i === 2 ? "col-start-3" : i === 1 ? "col-start-2" : ""}
            >
              <StepPill step={step} faded />
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease, delay: 0.4 }}
        className="mx-auto mt-6 max-w-md surface-elevated glow-subtle rounded-[var(--radius-md)] border-[rgb(99_102_241/0.25)] px-4 py-3 text-center text-sm font-medium text-[#818CF8] lg:mt-8"
      >
        Chronicle breaks this cycle — so teams decide with context, not from scratch.
      </motion.div>
    </div>
  );
}

function StepPill({ step, faded }: { step: string; faded: boolean }) {
  return (
    <div
      className={`surface rounded-[var(--radius-md)] px-3 py-2.5 text-center text-sm transition-shadow duration-300 hover:shadow-[0_8px_32px_rgb(0_0_0/0.2)] ${
        faded ? "border-[rgb(248_113_113/0.15)] text-red-300/80" : "text-slate-300"
      }`}
    >
      {step}
    </div>
  );
}
