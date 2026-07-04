"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const layers = [
  "Activity",
  "Organizational Memory",
  "Cognee Knowledge Graph",
  "Reasoning Engine",
  "Decision Guidance",
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ArchitectureVisual() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % layers.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-14 lg:mt-0">
      {/* Desktop: horizontal pipeline */}
      <div className="hidden lg:flex lg:flex-col lg:gap-0">
        <div className="relative flex items-center justify-between gap-1">
          {layers.map((label, i) => (
            <motion.div
              key={label}
              className="relative flex flex-1 flex-col items-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
            >
              {i > 0 && (
                <div className="absolute -left-1/2 top-5 z-0 h-px w-full bg-gradient-to-r from-[#6366F1]/10 via-[#6366F1]/30 to-[#6366F1]/10" />
              )}
              <motion.div
                animate={{
                  boxShadow:
                    activeIndex === i
                      ? "0 0 28px rgb(99 102 241 / 0.25)"
                      : "0 0 0px transparent",
                  borderColor:
                    activeIndex === i
                      ? "rgb(99 102 241 / 0.4)"
                      : "rgb(99 102 241 / 0.12)",
                }}
                transition={{ duration: 0.5 }}
                className={`relative z-10 w-full rounded-[var(--radius-md)] px-2 py-3.5 text-center text-xs font-medium ${
                  i === layers.length - 1 ? "text-[#818CF8]" : "text-slate-300"
                } surface`}
              >
                {label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="mx-auto max-w-xs lg:hidden">
        {layers.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease, delay: i * 0.08 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                boxShadow:
                  activeIndex === i
                    ? "0 0 24px rgb(99 102 241 / 0.2)"
                    : "0 0 0px transparent",
              }}
              className={`surface w-full rounded-[var(--radius-md)] px-4 py-3 text-center text-sm ${
                i === layers.length - 1
                  ? "border-[rgb(99_102_241/0.25)] font-medium text-[#818CF8]"
                  : "text-slate-300"
              }`}
            >
              {label}
            </motion.div>
            {i < layers.length - 1 && (
              <motion.div
                className="my-2 h-4 w-px bg-gradient-to-b from-[#6366F1]/40 to-[#6366F1]/10"
                animate={{ opacity: activeIndex === i ? 1 : 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-slate-500 lg:text-left"
      >
        Event-driven — reasoning that improves as your organization decides
      </motion.p>
    </div>
  );
}
