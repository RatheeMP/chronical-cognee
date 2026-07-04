"use client";

import ChroniAvatar from "@/components/chroni/ChroniAvatar";
import { MotionDiv, fadeInUp, transition } from "@/components/ui/motion";

type ChroniGuideProps = {
  message: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
};

export default function ChroniGuide({
  message,
  submessage,
  size = "lg",
  children,
}: ChroniGuideProps) {
  return (
    <MotionDiv
      {...fadeInUp}
      transition={{ ...transition, duration: 0.7 }}
      className="flex flex-col gap-6 sm:flex-row sm:items-start"
    >
      <ChroniAvatar size={size} />
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <span className="badge badge-cyan">Chroni</span>
          <p className="mt-3 text-lg font-medium leading-snug tracking-tight text-slate-100 sm:text-xl">
            {message}
          </p>
          {submessage && (
            <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
              {submessage}
            </p>
          )}
        </div>
        {children}
      </div>
    </MotionDiv>
  );
}
