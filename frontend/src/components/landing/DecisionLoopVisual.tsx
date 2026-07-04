"use client";

import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { label: "Current Decision", highlight: false },
  { label: "Chronicle", highlight: true },
  { label: "Past Organizational Reasoning", highlight: false },
  { label: "Hidden Trade-offs", highlight: false },
  { label: "Decision Guidance", highlight: true },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function DecisionLoopVisual() {
  return (
    <div className="mt-14">
      {/* Desktop horizontal flow */}
      <div className="relative hidden lg:block">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent" />
        <motion.div
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#38BDF8] shadow-[0_0_16px_rgb(56_189_248/0.7)]"
          initial={{ left: "0%", opacity: 0 }}
          whileInView={{ left: ["0%", "50%", "100%"], opacity: [0, 1, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 4, ease, delay: 0.5 }}
        />
        <div className="relative flex items-start justify-between gap-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease, delay: i * 0.1 }}
              className="flex max-w-[140px] flex-1 flex-col items-center"
            >
              <div
                className={`w-full rounded-[var(--radius-md)] px-2 py-3 text-center text-xs font-medium leading-snug transition-transform duration-300 hover:-translate-y-0.5 ${
                  step.highlight
                    ? "surface-elevated glow-subtle text-[#818CF8]"
                    : "surface text-slate-300"
                }`}
              >
                {step.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="mx-auto max-w-sm lg:hidden">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease, delay: i * 0.08 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-full rounded-[var(--radius-md)] px-4 py-3 text-center text-sm font-medium ${
                step.highlight
                  ? "surface-elevated glow-subtle text-[#818CF8]"
                  : "surface text-slate-300"
              }`}
            >
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="my-2 h-4 w-4 text-[#6366F1]/35" aria-hidden />
            )}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-slate-500"
      >
        Chronicle reasons over what your team already decided — surfacing
        trade-offs and consequences to weigh before the decision is final. It
        does not predict what will happen next.
      </motion.p>
    </div>
  );
}
