"use client";

import { Check, Circle } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type RoadmapTimelineVisualProps = {
  current: string[];
  future: string[];
};

export default function RoadmapTimelineVisual({
  current,
  future,
}: RoadmapTimelineVisualProps) {
  return (
    <div className="relative mt-12">
      <div className="absolute left-0 right-0 top-[18px] hidden h-px sm:block">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6366F1]/50 via-[#6366F1]/20 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease }}
          style={{ originX: 0 }}
        />
      </div>

      <div className="grid gap-12 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#6366F1] shadow-[0_0_12px_rgb(99_102_241/0.6)]" />
            <p className="text-xs font-medium text-slate-500">Available now</p>
          </div>
          <ul className="space-y-2">
            {current.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <Check className="h-3.5 w-3.5 text-emerald-400/80" aria-hidden />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="hidden items-center justify-center sm:flex"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-lg text-[#6366F1]/40">→</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.15 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full border border-slate-600 bg-transparent" />
            <p className="text-xs font-medium text-slate-600">Planned</p>
          </div>
          <ul className="space-y-2">
            {future.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <Circle className="h-3 w-3 text-slate-700" strokeWidth={1.5} aria-hidden />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
