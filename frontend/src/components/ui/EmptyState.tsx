"use client";

import type { LucideIcon } from "lucide-react";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <MotionDiv
      {...fadeInUp}
      transition={transition}
      className="surface flex flex-col items-center rounded-[var(--radius-xl)] px-6 py-16 text-center glow-subtle"
    >
      <ChroniAvatar size="md" />
      <div className="mt-5 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(99_102_241/0.08)]">
        <Icon
          className="h-5 w-5 text-[#818CF8]"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </MotionDiv>
  );
}
