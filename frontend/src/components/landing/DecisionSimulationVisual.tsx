"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";

const ease = [0.22, 1, 0.36, 1] as const;

const demoQuestion =
  "We're considering migrating from PostgreSQL to MongoDB. Based on previous decisions, what should we consider first?";

const demoAnswer = {
  intro:
    "When your team faced this before, here's the reasoning they recorded — assumptions worth reviewing again.",
  points: [
    {
      title: "Product Meeting #12",
      body: "The team chose PostgreSQL because reporting consistency and relational integrity mattered more than horizontal scaling. That trade-off may still apply.",
    },
    {
      title: "Customer interviews",
      body: "Enterprise clients relied heavily on audit reporting. The assumptions behind that requirement haven't been revisited since.",
    },
  ],
  closing:
    "These are prior trade-offs and assumptions to review — not a forecast of what will happen if you proceed.",
};

const explorerNodes = [
  { label: "Migration question", active: true },
  { label: "Product Meeting #12", active: true },
  { label: "Customer interviews", active: true },
  { label: "Architecture review", active: false },
];

export default function DecisionSimulationVisual() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease }}
      className="mt-14 overflow-hidden rounded-[var(--radius-xl)] border border-[rgb(99_102_241/0.15)] bg-[rgb(8_12_24/0.85)] shadow-[0_24px_80px_rgb(0_0_0/0.45),0_0_60px_rgb(99_102_241/0.06)] backdrop-blur-xl"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-[rgb(99_102_241/0.1)] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[rgb(248_113_113/0.5)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[rgb(250_204_21/0.4)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[rgb(52_211_153/0.4)]" />
        <span className="ml-3 text-xs text-slate-600">Chronicle · Workspace preview</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_240px]">
        {/* Chat panel */}
        <div className="border-b border-[rgb(99_102_241/0.08)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          {/* User message */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="mb-6 flex justify-end"
          >
            <div className="max-w-[90%] rounded-[var(--radius-md)] rounded-tr-sm bg-[rgb(30_27_75/0.5)] px-4 py-3">
              <span className="badge badge-cyan mb-2">Decision question</span>
              <p className="text-sm leading-relaxed text-slate-200">{demoQuestion}</p>
            </div>
          </motion.div>

          {/* Chronicle response */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease, delay: 0.15 }}
            className="flex gap-3"
          >
            <ChroniAvatar size="sm" interactive />
            <div className="min-w-0 flex-1 space-y-4">
              <span className="badge">Decision guidance</span>
              <p className="text-sm leading-relaxed text-slate-300">{demoAnswer.intro}</p>

              {demoAnswer.points.map((point, i) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.45 }}
                  className="overflow-hidden rounded-[var(--radius-md)] border border-[rgb(99_102_241/0.12)] bg-[rgb(15_23_42/0.5)]"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[rgb(99_102_241/0.05)]"
                  >
                    <span className="text-xs font-medium text-[#818CF8]">{point.title}</span>
                    {expanded === i ? (
                      <ChevronUp className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                    )}
                  </button>
                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-[rgb(99_102_241/0.08)] px-4 py-3 text-sm leading-relaxed text-slate-400">
                          {point.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-sm font-medium text-slate-200"
              >
                {demoAnswer.closing}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Memory Explorer preview */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="bg-[rgb(10_15_30/0.6)] p-4 sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Network className="h-3.5 w-3.5 text-[#818CF8]" aria-hidden />
            Memory Explorer
          </div>
          <div className="space-y-1">
            {explorerNodes.map((node, i) => (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-full rounded-[var(--radius-sm)] px-3 py-2 text-xs transition-all duration-300 ${
                    node.active
                      ? "border border-[rgb(99_102_241/0.2)] bg-[rgb(99_102_241/0.08)] text-slate-300"
                      : "text-slate-600 opacity-50"
                  }`}
                >
                  {node.label}
                </div>
                {i < explorerNodes.length - 1 && (
                  <div className="my-0.5 h-3 w-px bg-[#6366F1]/25" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
