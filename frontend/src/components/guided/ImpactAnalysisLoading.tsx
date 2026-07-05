"use client";

import { motion } from "framer-motion";

import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";

const STAGES = [
  "Connecting to organizational memory",
  "Retrieving historical decisions",
  "Building reasoning graph",
  "Evaluating potential consequences",
] as const;

type ImpactAnalysisLoadingProps = {
  completedStages: number;
  longWait: boolean;
};

function StageRow({
  label,
  status,
}: {
  label: string;
  status: "complete" | "active" | "pending";
}) {
  return (
    <motion.li
      layout
      initial={false}
      animate={{
        opacity: status === "pending" ? 0.55 : 1,
        x: 0,
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 text-sm"
    >
      <motion.span
        key={status}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-5 shrink-0 text-center text-base leading-none"
        aria-hidden
      >
        {status === "complete" ? "✓" : "⏳"}
      </motion.span>
      <span
        className={
          status === "complete"
            ? "text-slate-300"
            : status === "active"
              ? "font-medium text-slate-200"
              : "text-slate-500"
        }
      >
        {label}
      </span>
    </motion.li>
  );
}

export default function ImpactAnalysisLoading({
  completedStages,
  longWait,
}: ImpactAnalysisLoadingProps) {
  return (
    <Card className="surface-elevated border-[rgb(99_102_241/0.22)] p-6 sm:p-7" glow>
      <p className="text-base font-semibold leading-snug text-slate-100 sm:text-lg">
        🧠 Chronicle is analyzing organizational history...
      </p>

      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {longWait ? (
          <motion.span
            key="long-wait"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            Chronicle is still reasoning over your organization&apos;s history.
            Large memory graphs can take a little longer to analyze.
          </motion.span>
        ) : (
          <>
            Please wait while Chronicle retrieves relevant decisions, evaluates
            historical trade-offs, and builds an evidence-backed impact analysis.
          </>
        )}
      </p>

      {!longWait && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          This may take a few moments on the first request while organizational
          memory is being prepared.
        </p>
      )}

      <div className="mt-6">
        <ProgressBar label="Analyzing impact" />
      </div>

      <ul className="mt-6 space-y-3" aria-live="polite" aria-busy="true">
        {STAGES.map((label, index) => {
          const stageNumber = index + 1;
          let status: "complete" | "active" | "pending" = "pending";
          if (completedStages >= stageNumber) {
            status = "complete";
          } else if (completedStages === stageNumber - 1) {
            status = "active";
          }

          return <StageRow key={label} label={label} status={status} />;
        })}
      </ul>
    </Card>
  );
}
