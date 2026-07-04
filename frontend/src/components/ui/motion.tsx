"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionLi = motion.li;

export type MotionDivProps = HTMLMotionProps<"div">;
